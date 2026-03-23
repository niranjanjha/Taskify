import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, User, Clock, Plus } from 'lucide-react';
import SubtaskItem from './SubtaskItem';
import AddSubtask from './AddSubtask';

const API_BASE = 'http://localhost:4000/api/tasks';

const TaskDetailView = ({ task, onClose, onTaskUpdate, currentUser }) => {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [users, setUsers] = useState([]);
  const [fullTaskData, setFullTaskData] = useState(task);

  // Debug: Log the task data to understand its structure
  useEffect(() => {
    if (task) {
      // Fetch the full task data with populated owner information
      fetchFullTaskData();
      fetchSubtasks();
      fetchUsers();
    }
  }, [task]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchFullTaskData = async () => {
    try {
      const response = await fetch(`${API_BASE}/${task._id}/gp`, {
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch task details');
      
      const data = await response.json();
      setFullTaskData(data.task);
    } catch (err) {
      console.error('Error fetching full task data:', err);
      // Fallback to the original task data
      setFullTaskData(task);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchSubtasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/subtasks/${task._id}`, {
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch subtasks');
      
      const data = await response.json();
      setSubtasks(data.subtasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubtask = async (subtaskData) => {
    try {
      const response = await fetch(`${API_BASE}/subtasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(subtaskData)
      });
      
      if (!response.ok) throw new Error('Failed to add subtask');
      
      const data = await response.json();
      setSubtasks(prev => [...prev, data.subtask]);
      setShowAddSubtask(false);
      
      // Refresh the task to update completion status
      onTaskUpdate && onTaskUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateSubtask = async (subtaskId, updateData) => {
    try {
      const response = await fetch(`${API_BASE}/subtasks/update/${subtaskId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) throw new Error('Failed to update subtask');
      
      const data = await response.json();
      setSubtasks(prev => 
        prev.map(st => st._id === subtaskId ? data.subtask : st)
      );
      
      // Refresh the task to update completion status
      onTaskUpdate && onTaskUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/subtasks/delete/${subtaskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      setSubtasks(prev => prev.filter(st => st._id !== subtaskId));
      
      // Refresh the task to update completion status
      onTaskUpdate && onTaskUpdate();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting subtask:", err);
      alert(`Failed to delete subtask: ${err.message || "Please try again."}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-custom text-yellow-custom border-yellow-custom';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate subtask progress
  const getSubtaskProgress = () => {
    if (subtasks.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = subtasks.filter(st => st.status === 'Completed').length;
    const percentage = Math.round((completed / subtasks.length) * 100);
    
    return { completed, total: subtasks.length, percentage };
  };

  // Determine if task is complete based on subtasks
  const isTaskComplete = () => {
    const progress = getSubtaskProgress();
    return fullTaskData.completed || (progress.total > 0 && progress.completed === progress.total);
  };

  // Check if current user is the owner of the task
  const isOwner = () => {
    if (!fullTaskData || !currentUser) return false;
    
    // If task.owner is a string, it's likely an ID
    if (typeof fullTaskData.owner === 'string') {
      return fullTaskData.owner === currentUser.id;
    }
    
    // If task.owner is an object, check its _id property
    if (fullTaskData.owner && typeof fullTaskData.owner === 'object') {
      return fullTaskData.owner._id === currentUser.id;
    }
    
    // Fallback to localStorage userId
    const userId = localStorage.getItem('userId');
    if (userId) {
      if (typeof fullTaskData.owner === 'string') {
        return fullTaskData.owner === userId;
      }
      if (fullTaskData.owner && typeof fullTaskData.owner === 'object') {
        return fullTaskData.owner._id === userId;
      }
    }
    
    return false;
  };

  // Get owner email
  const getOwnerEmail = () => {
    if (!fullTaskData) return 'Unknown User';
    
    // If current user is the owner
    if (isOwner()) return 'You';
    
    // If owner is an object with email property
    if (fullTaskData.owner && typeof fullTaskData.owner === 'object') {
      return fullTaskData.owner.email || fullTaskData.owner.name || 'Unknown User';
    }
    
    // If owner is a string (ID), we can't display email without additional API call
    return 'Unknown User';
  };

  if (!fullTaskData) return null;

  const progress = getSubtaskProgress();

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-purple-100 rounded-xl max-w-2xl w-full shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${isTaskComplete() ? 'line-through text-gray-500' : 'text-gray-800'}`}>{fullTaskData.title}</h2>
            {fullTaskData.description && (
              <p className="text-gray-600 mt-2">{fullTaskData.description}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-gray-500 hover:text-purple-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Flag className="w-4 h-4 text-purple-500" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(fullTaskData.priority)}`}>
              {fullTaskData.priority} Priority
            </span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className="text-sm">
              Due: {formatDate(fullTaskData.dueDate)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <User className="w-4 h-4 text-purple-500" />
            <div>
              <span className="text-sm block">Owner</span>
              <span className="text-sm font-medium">
                {getOwnerEmail()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Clock className="w-4 h-4 text-purple-500" />
            <div>
              <span className="text-sm block">Status</span>
              <span className="text-sm font-medium">
                {isTaskComplete() ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {subtasks.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>Progress</span>
              <span>{progress.completed}/{progress.total} subtasks completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Assigned Users */}
        {fullTaskData.assignedTo && fullTaskData.assignedTo.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Assigned To</h3>
            <div className="flex flex-wrap gap-2">
              {fullTaskData.assignedTo.map((assignment, index) => (
                <div key={index} className="flex items-center gap-2 bg-purple-100 rounded-full px-3 py-1">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                    {assignment.user?.name ? assignment.user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="text-xs font-medium">{assignment.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-purple-700">{assignment.role || 'Member'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subtasks Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Subtasks</h3>
            <button
              onClick={() => setShowAddSubtask(true)}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
            >
              <Plus className="w-4 h-4" /> Add Subtask
            </button>
          </div>

          {showAddSubtask && (
            <AddSubtask 
              taskId={fullTaskData._id}
              onAdd={handleAddSubtask}
              onCancel={() => setShowAddSubtask(false)}
            />
          )}

          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading subtasks...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">Error: {error}</div>
          ) : subtasks.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No subtasks yet</div>
          ) : (
            <div className="space-y-2">
              {subtasks.map(subtask => (
                <SubtaskItem
                  key={subtask._id}
                  subtask={subtask}
                  isEditing={editingSubtaskId === subtask._id}
                  onEditStart={(id) => setEditingSubtaskId(id)}
                  onEditCancel={() => setEditingSubtaskId(null)}
                  onEditSave={(id, data) => {
                    handleUpdateSubtask(id, data);
                    setEditingSubtaskId(null);
                  }}
                  onUpdate={(id, data) => handleUpdateSubtask(id, data)}
                  onDelete={handleDeleteSubtask}
                />
              ))}
            </div>
          )}
        </div>

        {/* Timeline Visualization */}
        {subtasks.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Timeline</h3>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-purple-200"></div>
              
              <div className="space-y-4 pl-8">
                {subtasks
                  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                  .map((subtask, index) => (
                    <div key={subtask._id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute left-[-22px] top-3 w-3 h-3 rounded-full bg-purple-500 border-2 border-white"></div>
                      
                      <div className="p-3 bg-white border border-purple-100 rounded-lg shadow-sm">
                        <div className="flex justify-between">
                          <h4 className={`font-medium ${subtask.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {subtask.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(subtask.dueDate)}
                          </span>
                        </div>
                        {subtask.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {subtask.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            subtask.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            subtask.status === 'In Progress' ? 'bg-yellow-custom text-yellow-custom' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {subtask.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailView;