// components/TaskModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, X, Save, Calendar, AlignLeft, Flag, CheckCircle, UserPlus, User, Send, Sparkles } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomDropdown from './CustomDropdown';
import { baseControlClasses, priorityStyles, DEFAULT_TASK } from '../assets/dummy';
import { suggestAssignment } from '../lib/aiApi';

const API_BASE = 'http://localhost:4000/api/tasks';

const TaskModal = ({ isOpen, onClose, taskToEdit, onSave, onLogout }) => {
  const [taskData, setTaskData] = useState(DEFAULT_TASK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]); // For user assignment
  const [assignedUsers, setAssignedUsers] = useState([]); // Users assigned to this task
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('Member');
  const [notifiedUsers, setNotifiedUsers] = useState(new Set()); // Track notified users
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Fetch users for assignment
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/users`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        // Fallback to dummy data if API fails
        setUsers([
          { _id: '1', name: 'John Doe', email: 'john@example.com' },
          { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
          { _id: '3', name: 'Bob Johnson', email: 'bob@example.com' }
        ]);
      }
    };
    
    fetchUsers();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (taskToEdit) {
      const normalized = taskToEdit.completed === 'Yes' || taskToEdit.completed === true ? 'Yes' : 'No';
      setTaskData({
        ...DEFAULT_TASK,
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        priority: taskToEdit.priority || 'Low',
        dueDate: taskToEdit.dueDate?.split('T')[0] || '',
        completed: normalized,
        id: taskToEdit._id,
      });
      
      // Set assigned users if editing
      if (taskToEdit.assignedTo) {
        setAssignedUsers(taskToEdit.assignedTo.map(assignment => ({
          user: assignment.user,
          role: assignment.role || 'Member'
        })));
      }
    } else {
      setTaskData(DEFAULT_TASK);
      setAssignedUsers([]);
      setNotifiedUsers(new Set()); // Reset notified users when creating new task
    }
    setError(null);
  }, [isOpen, taskToEdit]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  }, []);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No auth token found');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const handleAiSuggest = async () => {
    if (!taskData.title) {
        toast.warning("Please enter a task title first!");
        return;
    }
    setIsSuggesting(true);
    setAiSuggestion('');
    try {
        const result = await suggestAssignment(`${taskData.title}. ${taskData.description}`);
        if (result.success) {
            setAiSuggestion(result.suggestion);
            
            // Auto-distribute logic based on teammate's tech stack (AI Suggestion)
            const suggestionText = result.suggestion.toLowerCase();
            // Try to find mentioned users
            const matchedUsers = users.filter(u => 
              suggestionText.includes(u.name.toLowerCase()) || 
              (u.name.split(' ')[0] && suggestionText.includes(u.name.split(' ')[0].toLowerCase()))
            );
            
            if (matchedUsers.length > 0) {
                setAssignedUsers(prev => {
                    const newAssignments = [...prev];
                    matchedUsers.forEach(mu => {
                        if (!newAssignments.some(au => au.user._id === mu._id)) {
                            newAssignments.push({ user: mu, role: 'Member' });
                        }
                    });
                    return newAssignments;
                });
                toast.success(`AI auto-assigned task to: ${matchedUsers.map(m => m.name).join(', ')}`);
            }
            
        } else {
            toast.error("Failed to get AI suggestion.");
        }
    } catch (err) {
        console.error(err);
        toast.error("AI suggestion failed.");
    } finally {
        setIsSuggesting(false);
    }
  };

  // Add user to assigned users list
  const addUserToTask = () => {
    if (!selectedUser) return;
    
    const userToAdd = users.find(u => u._id === selectedUser);
    if (userToAdd && !assignedUsers.some(au => au.user._id === selectedUser)) {
      setAssignedUsers(prev => [...prev, { user: userToAdd, role: selectedRole }]);
      setSelectedUser('');
      setSelectedRole('Member');
      setShowUserSelector(false);
    }
  };

  // Remove user from assigned users list
  const removeUserFromTask = (userId) => {
    setAssignedUsers(prev => prev.filter(au => au.user._id !== userId));
    // Also remove from notified users if they were notified
    setNotifiedUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  // Notify user via email
  const notifyUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      // For new tasks that haven't been saved yet, we need to save first
      if (!taskData.id) {
        // Save the task first
        const assignedUserData = assignedUsers.map(au => ({
          user: au.user._id, // Send only the user ID, not the entire user object
          role: au.role
        }));

        const taskPayload = {
          ...taskData,
          assignedTo: assignedUserData
        };

        const resp = await fetch(`${API_BASE}/gp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(taskPayload),
        });

        if (!resp.ok) {
          if (resp.status === 401) return onLogout?.();
          const err = await resp.json();
          throw new Error(err.message || 'Failed to save task');
        }
        
        const savedTask = await resp.json();
        
        // Update taskData with the new ID
        setTaskData(prev => ({ ...prev, id: savedTask.task._id }));
        
        // Now assign the specific user to trigger email
        const response = await fetch(`${API_BASE}/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            taskId: savedTask.task._id,
            userId: userId,
            role: assignedUsers.find(au => au.user._id === userId)?.role || 'Member'
          })
        });
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Failed to send notification');
        }
        
        const result = await response.json();
        // Mark user as notified
        setNotifiedUsers(prev => new Set(prev).add(userId));
        
        // Show success message based on email status
        if (result.emailSent) {
          toast.success('Notification sent successfully!');
        } else {
          toast.info('Task assigned successfully, but email notification failed.');
        }
      } else {
        // For existing tasks, just assign the user
        const response = await fetch(`${API_BASE}/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            taskId: taskData.id,
            userId: userId,
            role: assignedUsers.find(au => au.user._id === userId)?.role || 'Member'
          })
        });
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Failed to send notification');
        }
        
        const result = await response.json();
        // Mark user as notified
        setNotifiedUsers(prev => new Set(prev).add(userId));
        
        // Show success message based on email status
        if (result.emailSent) {
          toast.success('Notification sent successfully!');
        } else {
          toast.info('Task assigned successfully, but email notification failed.');
        }
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error('Failed to send notification. Please try again.');
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (taskData.dueDate < today) {
      setError('Due date cannot be in the past.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Prepare assigned users data
      const assignedUserData = assignedUsers.map(au => ({
        user: au.user._id,
        role: au.role
      }));

      const taskPayload = {
        ...taskData,
        assignedTo: assignedUserData
      };

      const isEdit = Boolean(taskData.id);
      const url = isEdit ? `${API_BASE}/${taskData.id}/gp` : `${API_BASE}/gp`;
      const resp = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(taskPayload),
      });
      if (!resp.ok) {
        if (resp.status === 401) return onLogout?.();
        const err = await resp.json();
        throw new Error(err.message || 'Failed to save task');
      }
      const saved = await resp.json();
      onSave?.(saved);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [taskData, today, getHeaders, onLogout, onSave, onClose, assignedUsers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="bg-white border border-purple-100 rounded-xl max-w-md w-full shadow-lg p-6 relative animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {taskData.id ? <Save className="text-purple-500 w-5 h-5" /> : <PlusCircle className="text-purple-500 w-5 h-5" />}
            {taskData.id ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-gray-500 hover:text-purple-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <div className="flex items-center border border-purple-100 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all duration-200">
              <input
                type="text" name="title" required value={taskData.title} onChange={handleChange}
                className="w-full focus:outline-none text-sm" placeholder="Enter task title"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <AlignLeft className="w-4 h-4 text-purple-500" /> Description
            </label>
            <textarea name="description" rows="3" value={taskData.description} onChange={handleChange}
              className={baseControlClasses} placeholder="Add details about your task" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Flag className="w-4 h-4 text-purple-500" /> Priority
              </label>
              <CustomDropdown
                options={['Low', 'Medium', 'High']}
                value={taskData.priority}
                onChange={(value) => setTaskData(prev => ({ ...prev, priority: value }))}
                className={`${priorityStyles[taskData.priority]}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-purple-500" /> Due Date
              </label>
              <input type="date" name="dueDate" required min={today} value={taskData.dueDate}
                onChange={handleChange} className={baseControlClasses} />
            </div>
          </div>
          
          {/* User Assignment Section */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <UserPlus className="w-4 h-4 text-purple-500" /> Assign Users
            </label>
            
            {/* Assigned Users Display */}
            {assignedUsers.length > 0 && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-2">
                  {assignedUsers.map((assignment, index) => (
                    <div key={index} className="flex items-center bg-purple-100 rounded-full px-3 py-1 text-sm">
                      <span className="mr-2">{assignment.user?.name || 'Unknown'} ({assignment.role || 'Member'})</span>
                      <div className="flex items-center gap-1">
                        {/* Notify User Button */}
                        {!notifiedUsers.has(assignment.user._id) && (
                          <button 
                            type="button"
                            onClick={() => notifyUser(assignment.user._id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Notify user"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        )}
                        {/* Notified Indicator */}
                        {notifiedUsers.has(assignment.user._id) && (
                          <span className="text-green-600 text-xs" title="Notified">
                            ✓
                          </span>
                        )}
                        <button 
                          type="button"
                          onClick={() => removeUserFromTask(assignment.user._id)}
                          className="text-purple-700 hover:text-purple-900"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* User Selector */}
            {showUserSelector ? (
              <div className="border border-purple-100 rounded-lg p-3 bg-purple-50">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select a user' },
                      ...users.map(user => ({
                        value: user._id,
                        label: `${user.name} (${user.email})`
                      }))
                    ]}
                    value={selectedUser}
                    onChange={setSelectedUser}
                    className={baseControlClasses}
                  />
                  <CustomDropdown
                    options={[
                      { value: 'Member', label: 'Member' },
                      { value: 'Designer', label: 'Designer' },
                      { value: 'Developer', label: 'Developer' },
                      { value: 'Manager', label: 'Manager' },
                      { value: 'Reviewer', label: 'Reviewer' }
                    ]}
                    value={selectedRole}
                    onChange={setSelectedRole}
                    className={baseControlClasses}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addUserToTask}
                    className="flex-1 bg-purple-500 text-white py-1.5 rounded-lg text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUserSelector(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-1.5 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserSelector(true)}
                  className="w-full flex items-center justify-center gap-2 border border-purple-200 text-purple-700 py-2 rounded-lg hover:bg-purple-50"
                >
                  <UserPlus className="w-4 h-4" /> Assign User
                </button>
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isSuggesting}
                  className="w-full flex items-center justify-center gap-2 border border-indigo-200 bg-indigo-50 text-indigo-700 py-2 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="w-4 h-4" /> {isSuggesting ? 'Thinking...' : 'AI Suggest'}
                </button>
              </div>
            )}
            {aiSuggestion && (
                <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800 flex gap-2 items-start animate-fadeIn">
                    <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <strong className="block mb-1">AI Recommendation</strong>
                        <p>{aiSuggestion}</p>
                    </div>
                </div>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-purple-500" /> Status
            </label>
            <div className="flex gap-4">
              {[{ val: 'Yes', label: 'Completed' }, { val: 'No', label: 'In Progress' }].map(({ val, label }) => (
                <label key={val} className="flex items-center">
                  <input type="radio" name="completed" value={val} checked={taskData.completed === val}
                    onChange={handleChange} className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md transition-all duration-200"
          >
            {loading ? 'Saving...' : (taskData.id ? <><Save className="w-4 h-4" /> Update Task</> : <><PlusCircle className="w-4 h-4" /> Create Task</>)}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;