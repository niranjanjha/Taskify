import { useState, useMemo, useCallback, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { Plus, Filter, Home as HomeIcon, Calendar as CalendarIcon, Flame, Users, Sparkles, Loader2 } from "lucide-react"
import TaskModal from "../components/AddTask"
import TaskItem from "../components/TaskItem"
import TaskDetailView from "../components/TaskDetailView"
import DeleteConfirmModal from "../components/DeleteConfirmModal"
import CustomDropdown from "../components/CustomDropdown"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import {
  WRAPPER, HEADER, ADD_BUTTON, STATS_GRID, STAT_CARD, ICON_WRAPPER, VALUE_CLASS, LABEL_CLASS,
  STATS, FILTER_OPTIONS, FILTER_LABELS, EMPTY_STATE, FILTER_WRAPPER, SELECT_CLASSES,
  TABS_WRAPPER, TAB_BASE, TAB_ACTIVE, TAB_INACTIVE
} from '../assets/dummy'

// API Base
const API_BASE = "http://localhost:4000/api/tasks"
const AI_BASE = "http://localhost:4000/api/ai"

const DEMO_MEETING = `Standup — March
- We agreed to ship the dashboard redesign by Friday; Alex owns UI, Sam owns API.
- Security review blocked the auth PR until Tuesday; Priya will follow up with the reviewer.
- Retro: we need clearer deadlines on cross-team tasks.`

const Dashboard = () => {
  const { tasks, refreshTasks, user } = useOutletContext()
  const [filter, setFilter] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [viewingTask, setViewingTask] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)

  const [aiOutput, setAiOutput] = useState("")
  const [meetingText, setMeetingText] = useState("")
  const [chatInput, setChatInput] = useState("")
  const [teamRolesText, setTeamRolesText] = useState("")
  const [assignTaskHint, setAssignTaskHint] = useState("")
  const [aiBusy, setAiBusy] = useState(false)
  
  // Refactored state for auto-insights
  const [deadlineInsight, setDeadlineInsight] = useState('');
  const [inactiveInsight, setInactiveInsight] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(false);

  const hasMemoryContext = useMemo(
    () => tasks.length > 0,
    [tasks.length]
  )

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token")
    return { Authorization: `Bearer ${token}` }
  }, [])

  /** Prevents hung AI requests from leaving aiBusy stuck true (which disables buttons). */
  const AI_TIMEOUT_MS = 90000

  const aiOpts = useCallback(
    () => ({
      headers: authHeaders(),
      timeout: AI_TIMEOUT_MS,
    }),
    [authHeaders]
  )

  const runAi = useCallback(async (fn) => {
    setAiBusy(true)
    try {
      await fn()
    } catch (e) {
      console.error(e)
      const msg =
        e.code === "ECONNABORTED"
          ? "AI request timed out — try again or check the server."
          : e.response?.data?.message || e.message || "Request failed"
      toast.error(msg)
      setAiOutput(`Error: ${msg}`)
    } finally {
      setAiBusy(false)
    }
  }, [])

  const fetchSuggestions = () =>
    runAi(async () => {
      const res = await axios.get(`${AI_BASE}/suggestions`, aiOpts())
      setAiOutput(res.data.data || "")
      toast.success("Suggestions ready")
    })

  const postSummarize = () =>
    runAi(async () => {
      const res = await axios.post(
        `${AI_BASE}/summarize`,
        { text: meetingText },
        aiOpts()
      )
      setAiOutput(res.data.summary || "")
      toast.success("Summary saved to Hindsight memory")
    })

  const fetchDeadlineInsights = () =>
    runAi(async () => {
      const res = await axios.get(`${AI_BASE}/deadline-insights`, aiOpts())
      setAiOutput(res.data.insights || "")
      toast.success("Deadline insights ready")
    })

  const fetchInactiveInsights = () =>
    runAi(async () => {
      const res = await axios.get(`${AI_BASE}/inactive-insights`, aiOpts())
      setAiOutput(res.data.insights || "")
      toast.success("Team risk analysis ready")
    })

  // Auto-fetch insights on load
  useEffect(() => {
    if (tasks.length === 0) return;
    
    let isMounted = true;
    const loadInsights = async () => {
      setInsightsLoading(true);
      try {
        const [deadlineRes, inactiveRes] = await Promise.all([
          axios.get(`${AI_BASE}/deadline-insights`, aiOpts()),
          axios.get(`${AI_BASE}/inactive-insights`, aiOpts())
        ]);
        if (isMounted) {
          setDeadlineInsight(deadlineRes.data.insights || "No deadline issues.");
          setInactiveInsight(inactiveRes.data.insights || "Team looks good.");
        }
      } catch (err) {
        console.error("Failed to load insights", err);
      } finally {
        if (isMounted) setInsightsLoading(false);
      }
    };
    
    loadInsights();
    return () => { isMounted = false; };
  }, [tasks.length, aiOpts]);

  const postChat = () =>
    runAi(async () => {
      const res = await axios.post(
        `${AI_BASE}/chat`,
        { message: chatInput },
        aiOpts()
      )
      setAiOutput(res.data.reply || "")
      setChatInput("")
      toast.success("Reply received")
    })

  const saveTeamRoles = () =>
    runAi(async () => {
      await axios.post(
        `${AI_BASE}/team-roles`,
        { roles: teamRolesText },
        aiOpts()
      )
      setAiOutput("Team roles saved to Hindsight memory. Future suggestions will use this context.")
      setTeamRolesText("")
      toast.success("Team roles saved to Hindsight memory")
    })

  const extractMeetingTasks = () =>
    runAi(async () => {
      const res = await axios.post(
        `${AI_BASE}/extract-meeting-tasks`,
        { text: meetingText },
        aiOpts()
      )
      const extracted = res.data.tasks
      setAiOutput(
        extracted?.length
          ? JSON.stringify(extracted, null, 2)
          : res.data.note || "No structured tasks parsed."
      )
      if (extracted?.length) {
        toast.success("Extracted tasks saved to Hindsight memory")
      } else {
        toast.info("No structured tasks found — check the output below")
      }
    })

  const postSuggestAssignment = () =>
    runAi(async () => {
      const res = await axios.post(
        `${AI_BASE}/suggest-assignment`,
        { task: assignTaskHint },
        aiOpts()
      )
      setAiOutput(res.data.suggestion || "")
      toast.success("Assignment suggestion ready")
    })

  // Calculate stats
  const stats = useMemo(() => ({
    total: tasks.length,
    lowPriority: tasks.filter(t => t.priority?.toLowerCase() === "low").length,
    mediumPriority: tasks.filter(t => t.priority?.toLowerCase() === "medium").length,
    highPriority: tasks.filter(t => t.priority?.toLowerCase() === "high").length,
    completed: tasks.filter(t =>
      t.completed === true || t.completed === 1 ||
      (typeof t.completed === "string" && t.completed.toLowerCase() === "yes")
    ).length,
  }), [tasks])

  // Filter tasks
  const filteredTasks = useMemo(() => tasks.filter(task => {
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7)
    switch (filter) {
      case "today":
        return dueDate.toDateString() === today.toDateString()
      case "week":
        return dueDate >= today && dueDate <= nextWeek
      case "high":
      case "medium":
      case "low":
        return task.priority?.toLowerCase() === filter
      default:
        return true
    }
  }), [tasks, filter])

  // Save tasks
  const handleTaskSave = useCallback(async (taskData) => {
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      
      if (taskData.id) {
        await axios.put(`${API_BASE}/${taskData.id}/gp`, taskData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${API_BASE}/gp`, taskData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      refreshTasks()
      setShowModal(false)
      setSelectedTask(null)
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }, [refreshTasks])

  // Handle task toggle (complete/incomplete)
  const handleTaskToggle = useCallback(async (taskId, completed) => {
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE}/${taskId}/gp`, { completed: completed ? "Yes" : "No" }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      refreshTasks()
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }, [refreshTasks])

  // Handle task deletion - open confirmation modal
  const handleTaskDelete = useCallback((task) => {
    setTaskToDelete(task)
    setShowDeleteModal(true)
  }, [])

  // Confirm and execute task deletion
  const confirmDeleteTask = useCallback(async () => {
    if (!taskToDelete) return;
    
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`${API_BASE}/${taskToDelete._id}/gp`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        refreshTasks()
        setShowDeleteModal(false)
        setTaskToDelete(null)
      } else {
        throw new Error(response.data.message || "Failed to delete task")
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      setShowDeleteModal(false)
      setTaskToDelete(null)
      // Show a more user-friendly error message
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete task. Please try again.";
      alert(`Error: ${errorMessage}`);
    }
  }, [taskToDelete, refreshTasks])

  // Handle menu click (for edit/delete)
  const handleMenuClick = useCallback((e, task) => {
    e.stopPropagation()
    setSelectedTask(task)
    setShowModal(true)
  }, [])

  return (
    <div className={WRAPPER}>
      {/* Header */}
      <div className={HEADER}>
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <HomeIcon className="text-purple-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className="truncate">Task Overview</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-7 truncate">Manage your tasks efficiently</p>
        </div>
        <button onClick={() => setShowModal(true)} className={ADD_BUTTON}>
          <Plus size={18} />
          Add New Task
        </button>
      </div>

      {/* Stats */}
      <div className={STATS_GRID}>
        {STATS.map(({ key, label, icon: Icon, iconColor, borderColor = "border-purple-100", valueKey, textColor, gradient }) => (
          <div key={key} className={`${STAT_CARD} ${borderColor}`}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`${ICON_WRAPPER} ${iconColor}`}><Icon className="w-4 h-4 md:w-5 md:h-5" /></div>
              <div className="min-w-0">
                <p className={`${VALUE_CLASS} ${gradient ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent" : textColor}`}>{stats[valueKey]}</p>
                <p className={LABEL_CLASS}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refactored AI Insights & Team Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Left: AI Insights */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-5 border border-purple-100 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Project Insights</h2>
            </div>
            {insightsLoading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
          </div>
          
          <div className="flex-1 space-y-4">
             {hasMemoryContext ? (
                <>
                  <div className="bg-white/80 rounded-lg p-3 border border-indigo-100/50 shadow-sm">
                    <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">Deadlines & Priority</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{deadlineInsight || "Analyzing deadlines..."}</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3 border border-indigo-100/50 shadow-sm">
                    <h3 className="text-xs font-bold text-pink-800 uppercase tracking-wider mb-1">Team Workload Risks</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{inactiveInsight || "Analyzing team risks..."}</p>
                  </div>
                </>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-white/50 rounded-lg border border-dashed border-indigo-200">
                   <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                     <Sparkles className="w-5 h-5 text-indigo-400" />
                   </div>
                   <p className="text-sm font-medium text-gray-700">No data to analyze</p>
                   <p className="text-xs text-gray-500 mt-1">Create some tasks and assign teammates so AI can provide insights.</p>
                </div>
             )}
          </div>
        </div>

        {/* Right: Team Tech Stack */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-purple-100 shadow-sm flex flex-col h-full">
           <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-fuchsia-600 shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Team Setup</h2>
           </div>
           <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Enter your teammates' tech stacks or roles. The AI will use this memory to automatically distribute tasks correctly!
           </p>
           
           <div className="flex flex-col gap-3 mt-auto">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Teammate Tech Stack</label>
              <textarea
                value={teamRolesText}
                onChange={(e) => setTeamRolesText(e.target.value)}
                placeholder="e.g., Alice — React, Bob — Node.js, Charlie — Design"
                rows={3}
                className="w-full text-sm rounded-lg border border-purple-100 p-3 focus:ring-2 focus:ring-purple-300 outline-none resize-none bg-purple-50/30"
              />
              <button
                type="button"
                disabled={aiBusy || !teamRolesText.trim()}
                onClick={saveTeamRoles}
                className="w-full sm:w-auto self-start px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {aiBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Save Tech Stack
              </button>
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Filter */}
        <div className={FILTER_WRAPPER}>
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="w-5 h-5 text-purple-500 shrink-0" />
            <h2 className="text-base md:text-lg font-semibold text-gray-800 truncate">{FILTER_LABELS[filter]}</h2>
          </div>
          <CustomDropdown
            options={FILTER_OPTIONS.map(opt => ({ 
              value: opt, 
              label: opt.charAt(0).toUpperCase() + opt.slice(1) 
            }))}
            value={filter}
            onChange={setFilter}
            className="md:hidden"
          />
          <div className={TABS_WRAPPER}>
            {FILTER_OPTIONS.map(opt => (
              <button key={opt} onClick={() => setFilter(opt)} className={`${TAB_BASE} ${filter === opt ? TAB_ACTIVE : TAB_INACTIVE}`}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</button>
            ))}
          </div>
        </div>

        {/* Assigned Tasks Section */}
        {(() => {
          // Get current user ID from localStorage
          const currentUserId = localStorage.getItem('userId');
          
          // Filter tasks that are assigned to the current user but not owned by them
          const assignedTasks = tasks.filter(task => {
            // Check if task is assigned to current user
            const isAssigned = task.assignedTo && task.assignedTo.some(assignment => {
              // Check if the assignment user ID matches current user ID
              return assignment.user && assignment.user._id === currentUserId;
            });
            
            // Task is not owned by the current user
            const isNotOwner = task.owner && task.owner !== currentUserId;
            
            return isAssigned && isNotOwner;
          });

          // Only render if there are assigned tasks
          if (assignedTasks.length === 0) return null;

          return (
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-purple-100">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                Assigned to You
              </h3>
              
              <div className="space-y-3">
                {assignedTasks.map(task => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    onToggle={handleTaskToggle}
                    onMenuClick={handleMenuClick}
                    onViewDetails={setViewingTask}
                    onEdit={() => { setSelectedTask(task); setShowModal(true); }}
                    onDelete={() => handleTaskDelete(task)}
                    onRefresh={refreshTasks}
                    showCompleteCheckbox={true}
                    className="border-l-4 border-purple-300"
                    currentUser={user}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className={EMPTY_STATE.wrapper}>
              <div className={EMPTY_STATE.iconWrapper}><CalendarIcon className="w-8 h-8 text-purple-500" /></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No tasks found</h3>
              <p className="text-sm text-gray-500 mb-4">{filter === "all" ? "Create your first task to get started" : "No tasks match this filter"}</p>
              <button onClick={() => setShowModal(true)} className={EMPTY_STATE.btn}>Add New Task</button>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskItem
                key={task._id || task.id}
                task={task}
                onToggle={handleTaskToggle}
                onMenuClick={handleMenuClick}
                onViewDetails={setViewingTask}
                onEdit={() => { setSelectedTask(task); setShowModal(true); }}
                onDelete={() => handleTaskDelete(task)}
                currentUser={user}
              />
            ))
          )}
        </div>

        {/* Add Task (Desktop) */}
        <div onClick={() => setShowModal(true)} className="hidden md:flex items-center justify-center p-4 border-2 border-dashed border-purple-200 rounded-xl hover:border-purple-400 bg-purple-50/50 cursor-pointer transition-colors">
          <Plus className="w-5 h-5 text-purple-500 mr-2" />
          <span className="text-gray-600 font-medium">Add New Task</span>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <TaskModal
        isOpen={showModal || !!selectedTask}
        onClose={() => { setShowModal(false); setSelectedTask(null); }}
        taskToEdit={selectedTask}
        onSave={handleTaskSave}
      />

      {/* Task Detail View */}
      {viewingTask && (
        <TaskDetailView
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onTaskUpdate={refreshTasks}
          currentUser={user}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTaskToDelete(null);
        }}
        onConfirm={confirmDeleteTask}
        taskTitle={taskToDelete?.title || ''}
      />
    </div>
  )
}

export default Dashboard