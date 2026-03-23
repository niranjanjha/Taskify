import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const AddSubtask = ({ taskId, onAdd, onCancel }) => {
  const [subtaskData, setSubtaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'Pending'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubtaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subtaskData.title.trim()) return;
    
    onAdd({
      ...subtaskData,
      taskId
    });
    
    // Reset form
    setSubtaskData({
      title: '',
      description: '',
      dueDate: '',
      status: 'Pending'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          name="title"
          value={subtaskData.title}
          onChange={handleChange}
          placeholder="Subtask title"
          className="flex-1 px-2 py-1 text-sm border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
          required
        />
        <button
          type="submit"
          className="p-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-gray-500 hover:bg-gray-200 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          name="description"
          value={subtaskData.description}
          onChange={handleChange}
          placeholder="Description (optional)"
          className="px-2 py-1 text-sm border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <input
          type="date"
          name="dueDate"
          value={subtaskData.dueDate}
          onChange={handleChange}
          className="px-2 py-1 text-sm border border-purple-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>
    </form>
  );
};

export default AddSubtask;