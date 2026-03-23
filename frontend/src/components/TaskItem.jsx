import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, Flag, Calendar, MoreHorizontal, User, List, Edit2, Trash2 } from 'lucide-react';
import { TI_CLASSES, getPriorityColor } from '../assets/dummy';

const TaskItem = ({ task, onToggle, onMenuClick, onViewDetails, onEdit, onDelete, currentUser }) => {
  const [subtaskProgress, setSubtaskProgress] = useState({ completed: 0, total: 0 });
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Calculate subtask progress
    if (task.subtasks && task.subtasks.length > 0) {
      const completed = task.subtasks.filter(st => st.status === 'Completed').length;
      setSubtaskProgress({
        completed,
        total: task.subtasks.length
      });
    } else {
      setSubtaskProgress({ completed: 0, total: 0 });
    }
  }, [task.subtasks]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Determine if task is complete based on subtasks
  const isTaskComplete = 
    task.completed === true || 
    task.completed === 1 || 
    (typeof task.completed === 'string' && task.completed.toLowerCase() === 'yes') || 
    (subtaskProgress.total > 0 && subtaskProgress.completed === subtaskProgress.total);

  // Check if current user is the owner of the task
  // Fix: Properly check if the current user is the task owner
  const isOwner = () => {
    // Get current user ID from currentUser object or localStorage
    const currentUserId = currentUser?.id || localStorage.getItem('userId');
    
    // Handle different formats of task.owner
    if (!task.owner) return false;
    
    // If task.owner is a string (ObjectId), compare directly
    if (typeof task.owner === 'string') {
      return task.owner === currentUserId;
    }
    
    // If task.owner is an object (populated), compare with _id
    if (typeof task.owner === 'object' && task.owner !== null) {
      return (task.owner._id || task.owner.id) === currentUserId;
    }
    
    return false;
  };
  
  const isOwnerResult = isOwner();
  
  // Add debugging
  console.log('Task object:', task);
  console.log('Task owner:', task.owner);
  console.log('Current user ID:', currentUser?.id || localStorage.getItem('userId'));
  console.log('Is owner:', isOwnerResult);

  // Check if current user is assigned to the task
  const isAssigned = task.assignedTo && task.assignedTo.some(assignment => {
    if (!assignment.user) return false;
    
    const currentUserId = currentUser?.id || localStorage.getItem('userId');
    
    // Handle different formats of assignment.user
    if (typeof assignment.user === 'string') {
      return assignment.user === currentUserId;
    }
    
    if (typeof assignment.user === 'object' && assignment.user !== null) {
      return (assignment.user._id || assignment.user.id) === currentUserId;
    }
    
    return false;
  });

  // Handle menu option click
  const handleMenuOption = (action) => {
    setShowMenu(false);
    switch (action) {
      case 'edit':
        onEdit && onEdit(task);
        break;
      case 'delete':
        onDelete && onDelete(task);
        break;
      default:
        break;
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    onViewDetails && onViewDetails(task);
  };

  return (
    <div className={TI_CLASSES.wrapper}>
      <div className={TI_CLASSES.leftContainer}>
        <button 
          onClick={() => onToggle(task._id, !isTaskComplete)}
          className={TI_CLASSES.completeBtn}
        >
          {isTaskComplete ? (
            <CheckCircle className={`${TI_CLASSES.checkboxIconBase} text-green-500`} />
          ) : (
            <Circle className={TI_CLASSES.checkboxIconBase} />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`${TI_CLASSES.titleBase} ${isTaskComplete ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {task.title}
              {/* Show assigned tag if user is assigned but not owner */}
              {isAssigned && !isOwnerResult && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Assigned to you
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleViewDetails}
                className="text-xs text-purple-600 hover:text-purple-800"
              >
                View Details
              </button>
              {/* Delete button visible only to task owner */}
              {isOwnerResult && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete && onDelete(task);
                  }}
                  className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          
          {task.description && (
            <p className={TI_CLASSES.description}>
              {task.description}
            </p>
          )}
          
          {/* Assigned Users */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <User className="w-3 h-3 text-gray-400" />
              <div className="flex -space-x-1">
                {task.assignedTo.slice(0, 3).map((assignment, index) => (
                  <div 
                    key={index} 
                    className="w-5 h-5 rounded-full bg-purple-100 border border-white flex items-center justify-center text-xs text-purple-700"
                    title={`${assignment.user?.name || 'Unknown'} (${assignment.role || 'Member'})`}
                  >
                    {assignment.user?.name ? assignment.user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                ))}
                {task.assignedTo.length > 3 && (
                  <div className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-xs text-gray-500">
                    +{task.assignedTo.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Subtask Progress */}
          {subtaskProgress.total > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Subtasks</span>
                <span>{subtaskProgress.completed}/{subtaskProgress.total} completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-purple-600 h-1.5 rounded-full" 
                  style={{ width: `${(subtaskProgress.completed / subtaskProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className={TI_CLASSES.rightContainer}>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        
        <div className={TI_CLASSES.dateRow}>
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
        
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={TI_CLASSES.menuButton}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className={TI_CLASSES.menuDropdown}>
              <button
                onClick={() => handleMenuOption('edit')}
                className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-purple-50"
              >
                <Edit2 size={14} className="text-purple-600 mr-2" />
                Edit Task
              </button>
              {/* Only show delete option to task owner */}
              {isOwnerResult && (
                <button
                  onClick={() => handleMenuOption('delete')}
                  className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-red-50"
                >
                  <Trash2 size={14} className="text-red-600 mr-2" />
                  Delete Task
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;