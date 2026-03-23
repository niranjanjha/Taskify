import React, { useState } from 'react';
import { Check, X, Edit, Save, Trash2, Calendar } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

const SubtaskItem = ({ 
  subtask, 
  onUpdate, 
  onDelete,
  isEditing,
  onEditStart,
  onEditCancel,
  onEditSave
}) => {
  const [editData, setEditData] = useState({
    title: subtask.title,
    description: subtask.description || '',
    dueDate: subtask.dueDate ? subtask.dueDate.split('T')[0] : '',
    status: subtask.status || 'Pending'
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onEditSave(subtask._id, editData);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-custom text-yellow-custom';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
        <input
          type="text"
          name="title"
          value={editData.title}
          onChange={handleEditChange}
          className="flex-1 px-2 py-1 text-sm border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
          placeholder="Subtask title"
        />
        <CustomDropdown
          options={[
            { value: 'Pending', label: 'Pending' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' }
          ]}
          value={editData.status}
          onChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
          className="text-sm"
        />
        <input
          type="date"
          name="dueDate"
          value={editData.dueDate}
          onChange={handleEditChange}
          className="text-sm border border-purple-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-100 rounded"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          onClick={onEditCancel}
          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg transition-colors">
      <button
        onClick={() => onUpdate(subtask._id, { status: subtask.status === 'Completed' ? 'Pending' : 'Completed' })}
        className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
          subtask.status === 'Completed' 
            ? 'bg-green-500 border-green-500 text-white' 
            : 'border-gray-300'
        }`}
      >
        {subtask.status === 'Completed' && <Check className="w-3 h-3" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${subtask.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {subtask.title}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(subtask.status)}`}>
            {subtask.status}
          </span>
        </div>
        {subtask.description && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            {subtask.description}
          </p>
        )}
        {subtask.dueDate && (
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {formatDate(subtask.dueDate)}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex gap-1">
        <button
          onClick={() => onEditStart(subtask._id)}
          className="p-1 text-gray-500 hover:bg-purple-100 rounded"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(subtask._id)}
          className="p-1 text-red-500 hover:bg-red-100 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SubtaskItem;