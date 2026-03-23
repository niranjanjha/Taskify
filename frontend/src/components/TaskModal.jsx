  // Notify user via email
  const notifyUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      // For new tasks that haven't been saved yet, we need to save first
      if (!taskData.id) {
        // Save the task first
        const assignedUserData = assignedUsers.map(au => ({
          user: au.user._id,
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
          throw new Error('Failed to send notification');
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
          throw new Error('Failed to send notification');
        }
      }
      
      // Mark user as notified
      setNotifiedUsers(prev => new Set(prev).add(userId));
      
      // Show success message
      alert('Notification sent successfully!');
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Failed to send notification. Please try again.');
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

  return (
    <div className="task-form">
      <form onSubmit={handleSubmit}>
        <div className="task-form__header">
          <h2>{taskData.id ? 'Edit Task' : 'Create New Task'}</h2>
          <button type="button" onClick={onClose} className="task-form__close-btn">
            <FaTimes />
          </button>
        </div>
        <div className="task-form__body">
          <div className="task-form__field">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={taskData.title}
              onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div className="task-form__field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <div className="task-form__field">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={taskData.dueDate}
              onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
              required
            />
          </div>
          <div className="task-form__field">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={taskData.priority}
              onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value }))}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="task-form__field">
            <label>Assigned Users</label>
            <div className="task-form__assigned-users">
              {assignedUsers.map((au, index) => (
                <div key={index} className="task-form__assigned-user">
                  <span>{au.user?.name || 'Unknown'}</span>
                  <select
                    value={au.role}
                    onChange={(e) => {
                      const updatedUsers = assignedUsers.map((u, i) =>
                        i === index ? { ...u, role: e.target.value } : u
                      );
                      setAssignedUsers(updatedUsers);
                    }}
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedUsers = assignedUsers.filter((_, i) => i !== index);
                      setAssignedUsers(updatedUsers);
                    }}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddUser}>
                <FaUserPlus />
              </button>
            </div>
          </div>
          <div className="task-form__field">
            <label>Notify Users</label>
            <div className="task-form__notify-users">
              {assignedUsers.map((au, idx) => (
                <div key={au.user?._id || idx} className="task-form__notify-user">
                  <span>{au.user?.name || 'Unknown'}</span>
                  <button
                    type="button"
                    onClick={() => notifyUser(au.user._id)}
                    disabled={notifiedUsers.has(au.user._id)}
                  >
                    {notifiedUsers.has(au.user._id) ? 'Notified' : 'Notify'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="task-form__footer">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          {error && <p className="task-form__error">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default TaskModal;
