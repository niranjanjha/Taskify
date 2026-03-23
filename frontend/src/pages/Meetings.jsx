import React, { useState } from 'react';
import { MessageSquare, FileText, CheckCircle2, ChevronRight, Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { summarizeMeeting, extractMeetingTasks } from '../lib/aiApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';

const DEMO_TRANSCRIPT = `Standup — March 15th
Alice: Hey everyone, let's go over the UI redesign. 
Bob: I finished the layout for the dashboard but I still need to fix the responsive styling for mobile. I'll get that done by Friday.
Alice: Great. Charlie, where are we with the backend APIs?
Charlie: Security review blocked the auth PR until Tuesday. I'll follow up with the reviewer so we can unblock the team.
Alice: OK, let's make sure we have clearer deadlines on these cross-team tasks for the retro.`;

const Meetings = () => {
  const { refreshTasks } = useOutletContext();
  const [transcript, setTranscript] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  
  const [summary, setSummary] = useState('');
  const [extractedTasks, setExtractedTasks] = useState([]);

  const handleSummarize = async () => {
    if (!transcript.trim()) return toast.warning("Please enter a meeting transcript first.");
    setIsSummarizing(true);
    setSummary('');
    try {
      const result = await summarizeMeeting(transcript);
      setSummary(result.summary || result);
      toast.success("Meeting summarized successfully!");
    } catch (err) {
      toast.error("Failed to generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleExtractTasks = async () => {
    if (!transcript.trim()) return toast.warning("Please enter a meeting transcript first.");
    setIsExtracting(true);
    setExtractedTasks([]);
    try {
      const result = await extractMeetingTasks(transcript);
      if (result && result.tasks) {
        setExtractedTasks(result.tasks.map(t => ({...t, selected: true})));
        toast.success("Tasks extracted successfully!");
      } else {
        toast.info("No actionable tasks found in this transcript.");
      }
    } catch (err) {
      toast.error("Failed to extract tasks.");
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleTaskSelection = (index) => {
    const updated = [...extractedTasks];
    updated[index].selected = !updated[index].selected;
    setExtractedTasks(updated);
  };

  const createSelectedTasks = async () => {
    const tasksToCreate = extractedTasks.filter(t => t.selected);
    if (tasksToCreate.length === 0) return toast.warning("No tasks selected.");
    
    setIsCreatingTasks(true);
    const token = localStorage.getItem('token');
    
    try {
      // First, get users to try to match assignees
      const usersRes = await axios.get('http://localhost:4000/api/tasks/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = usersRes.data.users || [];
      
      let successCount = 0;
      for (const t of tasksToCreate) {
        // Try to match assignee name
        let assignedUserData = [];
        if (t.suggestedAssignee) {
           const assigneeQuery = t.suggestedAssignee.toLowerCase();
           const matchedUser = users.find(u => 
             u.name.toLowerCase().includes(assigneeQuery) || 
             assigneeQuery.includes(u.name.split(' ')[0].toLowerCase())
           );
           if (matchedUser) {
             assignedUserData.push({ user: matchedUser._id, role: 'Member' });
           }
        }

        const taskPayload = {
          title: t.title,
          description: "Auto-extracted from meeting transcript.",
          priority: "Medium", // default
          assignedTo: assignedUserData
        };

        if (t.dueHint && t.dueHint !== 'none') {
           // We could parse natural date, but for now we let it remain blank or attempt a basic parse
        }

        await axios.post('http://localhost:4000/api/tasks/gp', taskPayload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        successCount++;
      }
      
      refreshTasks();
      setExtractedTasks([]);
      toast.success(`Successfully auto-distributed ${successCount} task(s)!`);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating tasks.");
    } finally {
      setIsCreatingTasks(false);
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      
      <div className="mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="text-purple-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
          <span>Meetings & Transcripts</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1 ml-7 md:ml-8">
          Turn your chaotic meetings into structured summaries and actionable tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-5 lg:p-6">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                Raw Transcript
             </h2>
             <button 
                onClick={() => setTranscript(DEMO_TRANSCRIPT)}
                className="text-xs text-purple-600 hover:text-purple-800 underline transition-colors"
             >
                Load Demo Text
             </button>
          </div>
          
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting notes or Zoom transcript here..."
            className="w-full h-64 p-4 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm resize-none bg-purple-50/30"
          />

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
             <button 
               onClick={handleSummarize}
               disabled={isSummarizing || !transcript.trim()}
               className="flex-1 bg-white border border-purple-200 text-purple-700 font-semibold py-2.5 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
               Generate Summary
             </button>
             <button 
               onClick={handleExtractTasks}
               disabled={isExtracting || !transcript.trim()}
               className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-semibold py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
               Extract Tasks
             </button>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
           
           {/* Summary Section */}
           {summary && (
             <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-5 lg:p-6 animate-fadeIn">
                <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-3">
                   <FileText className="w-5 h-5 text-indigo-500" />
                   Meeting Summary
                </h2>
                <div className="prose prose-sm text-indigo-800 whitespace-pre-wrap">
                   {summary}
                </div>
             </div>
           )}

           {/* Tasks Section */}
           {extractedTasks.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm border border-fuchsia-100 p-5 lg:p-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                     <CheckCircle2 className="w-5 h-5 text-fuchsia-500" />
                     Extracted Tasks
                  </h2>
                  <span className="bg-fuchsia-100 text-fuchsia-800 text-xs font-bold px-2 py-1 rounded-full">
                     {extractedTasks.filter(t => t.selected).length} selected
                  </span>
                </div>
                
                <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-2">
                   {extractedTasks.map((task, idx) => (
                      <div 
                         key={idx} 
                         onClick={() => toggleTaskSelection(idx)}
                         className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${task.selected ? 'bg-fuchsia-50 border-fuchsia-200' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                      >
                         <input 
                           type="checkbox" 
                           checked={task.selected} 
                           onChange={() => {}} 
                           className="mt-1 w-4 h-4 text-fuchsia-600 rounded border-gray-300 focus:ring-fuchsia-500 cursor-pointer"
                         />
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                               {task.suggestedAssignee && (
                                   <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                      👤 {task.suggestedAssignee}
                                   </span>
                               )}
                               {task.dueHint && (
                                   <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                                      ⏱ {task.dueHint}
                                   </span>
                               )}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                <button 
                  onClick={createSelectedTasks}
                  disabled={isCreatingTasks || extractedTasks.filter(t => t.selected).length === 0}
                  className="w-full bg-gray-900 text-white font-semibold py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-black transition-colors"
                >
                  {isCreatingTasks ? 'Distributing...' : <><PlusCircle className="w-4 h-4" /> Auto-Distribute to Team</>}
                </button>
             </div>
           )}

           {/* Empty State */}
           {!summary && extractedTasks.length === 0 && (
             <div className="bg-gray-50/50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-8 h-full text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                   <Sparkles className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="font-semibold text-gray-700 mb-1">Awaiting Transcripts</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                   Paste your meeting notes on the left to see the AI automatically summarize the discussion and assign tasks to teammates.
                </p>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default Meetings;
