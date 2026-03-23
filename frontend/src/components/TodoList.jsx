import React from 'react';
import { CheckCircle, Circle, Edit3, Trash2, Save, X } from 'lucide-react';

const TodoList = ({ 
  todos, 
  onToggleComplete, 
  onDelete, 
  onEdit,
  editingTodoId,
  editingText,
  setEditingText,
  onSaveEditing,
  onCancelEditing
}) => {
  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tasks yet. Add your first task above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <div 
          key={todo._id} 
          className={`p-4 rounded-lg border transition-all duration-200 ${
            todo.isCompleted 
              ? 'bg-green-50 border-green-200' 
              : 'bg-white border-purple-100 hover:shadow-sm'
          }`}
        >
          {editingTodoId === todo._id ? (
            // Edit mode
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={onCancelEditing}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={onSaveEditing}
                  className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-1"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <div className="flex items-start gap-3">
              <button
                onClick={() => onToggleComplete(todo._id, todo.isCompleted)}
                className="mt-1 text-gray-400 hover:text-green-500 transition-colors"
              >
                {todo.isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-gray-800 ${todo.isCompleted ? 'line-through text-gray-500' : ''}`}>
                  {todo.taskText}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Created: {new Date(todo.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(todo)}
                  className="p-1.5 text-gray-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => onDelete(todo._id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TodoList;