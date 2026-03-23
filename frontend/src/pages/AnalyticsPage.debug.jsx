import React from 'react';
import { useOutletContext } from 'react-router-dom';

// Debug component to check the task data structure
const AnalyticsDebug = () => {
  const { tasks = [] } = useOutletContext();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Task Data Debug</h1>
      <p className="mb-4">Total tasks: {tasks.length}</p>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Task Structure Sample:</h2>
        {tasks.length > 0 ? (
          <pre className="text-xs overflow-auto">
            {JSON.stringify(tasks[0], null, 2)}
          </pre>
        ) : (
          <p>No tasks available</p>
        )}
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">All Tasks:</h2>
        {tasks.map((task, index) => (
          <div key={task._id || index} className="mb-2 p-2 bg-white rounded border">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Completed:</strong> {JSON.stringify(task.completed)} (Type: {typeof task.completed})</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Created:</strong> {task.createdAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsDebug;