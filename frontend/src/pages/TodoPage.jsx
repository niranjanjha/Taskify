import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import axios from 'axios';
import TodoList from '../components/TodoList';
import DoodleCanvas from '../components/DoodleCanvas';

const API_BASE = 'http://localhost:4000/api/todos';

const TodoPage = () => {
  const { user } = useOutletContext();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [doodleData, setDoodleData] = useState('');
  const [showDoodle, setShowDoodle] = useState(false);

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/gp`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodos(response.data.todos || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Create a new todo
  const handleCreateTodo = async () => {
    if (!newTodoText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/gp`,
        { taskText: newTodoText, doodleData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setTodos([response.data.todo, ...todos]);
        setNewTodoText('');
        setDoodleData('');
        setShowDoodle(false);
      }
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  // Update todo
  const handleUpdateTodo = async (id, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE}/${id}/gp`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setTodos(todos.map(todo => 
          todo._id === id ? { ...todo, ...updates } : todo
        ));
        setEditingTodoId(null);
        setEditingText('');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  // Delete todo
  const handleDeleteTodo = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_BASE}/${id}/gp`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setTodos(todos.filter(todo => todo._id !== id));
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // Toggle completion status
  const handleToggleComplete = async (id, isCompleted) => {
    await handleUpdateTodo(id, { isCompleted: !isCompleted });
  };

  // Start editing
  const startEditing = (todo) => {
    setEditingTodoId(todo._id);
    setEditingText(todo.taskText);
  };

  // Save editing
  const saveEditing = () => {
    if (editingText.trim()) {
      handleUpdateTodo(editingTodoId, { taskText: editingText });
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTodoId(null);
    setEditingText('');
  };

  // Handle doodle save
  const handleDoodleSave = (dataUrl) => {
    setDoodleData(dataUrl);
    setShowDoodle(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">To Do List</h1>
        <p className="text-gray-600">Manage your daily tasks and doodles</p>
      </div>

      {/* Add new todo form */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateTodo()}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowDoodle(true)}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors flex items-center gap-2"
            >
              <Edit3 size={16} />
              <span className="hidden sm:inline">Doodle</span>
            </button>
            <button
              onClick={handleCreateTodo}
              className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-lg hover:shadow-md transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

        {/* Doodle canvas modal */}
        {showDoodle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Draw Your Doodle</h3>
                <button 
                  onClick={() => setShowDoodle(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <DoodleCanvas 
                onSave={handleDoodleSave} 
                onCancel={() => setShowDoodle(false)} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Main content - To Do List and Doodle Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* To Do List */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Tasks</h2>
          <TodoList
            todos={todos}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTodo}
            onEdit={startEditing}
            editingTodoId={editingTodoId}
            editingText={editingText}
            setEditingText={setEditingText}
            onSaveEditing={saveEditing}
            onCancelEditing={cancelEditing}
          />
        </div>

        {/* Doodle Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Doodle Space</h2>
          <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 min-h-[300px] flex flex-col">
            {doodleData ? (
              <div className="flex-1 flex flex-col">
                <div className="mb-3 flex justify-between items-center">
                  <h3 className="font-medium">Your Doodle</h3>
                  <button
                    onClick={() => setDoodleData('')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg p-2">
                  <img 
                    src={doodleData} 
                    alt="Doodle" 
                    className="max-h-[250px] object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <Edit3 size={48} className="mb-3 text-purple-300" />
                <p className="text-center mb-3">No doodle yet</p>
                <button
                  onClick={() => setShowDoodle(true)}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  Create a Doodle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;