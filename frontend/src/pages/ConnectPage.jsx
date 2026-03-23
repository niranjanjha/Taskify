import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Phone, Users, Filter, MessageCircle, Send, X } from 'lucide-react';
import VideoCall from '../components/VideoCall';
import CustomDropdown from '../components/CustomDropdown';
import { SORT_OPTIONS } from '../assets/dummy';
import io from 'socket.io-client';

const ConnectPage = () => {
  const { tasks, user } = useOutletContext();
  const [sortBy, setSortBy] = useState("newest");
  const [activeCall, setActiveCall] = useState(null);
  const [activeChat, setActiveChat] = useState(null); // For text chat
  const [messages, setMessages] = useState({}); // Store messages for each task
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Filter tasks that are assigned to the current user but not owned by them
  const collaboratedTasks = tasks.filter(task => {
    // Check if current user is assigned to the task
    const isAssigned = task.assignedTo && task.assignedTo.some(assignment => 
      assignment.user && assignment.user._id === (user?.id || localStorage.getItem('userId'))
    );
    
    // Check if current user is the owner of the task
    const isOwner = task.owner === (user?.id || localStorage.getItem('userId'));
    
    // Return tasks where user is assigned but not the owner
    return isAssigned && !isOwner;
  });

  const sortedCollaboratedTasks = [...collaboratedTasks].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt)
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt)
      case "priority": {
        const order = { high: 3, medium: 2, low: 1 }
        return order[b.priority?.toLowerCase()] - order[a.priority?.toLowerCase()]
      }
      default:
        return 0
    }
  });

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    // Join rooms for all collaborated tasks
    collaboratedTasks.forEach(task => {
      newSocket.emit('join-room', task._id, newSocket.id);
    });

    // Listen for messages
    newSocket.on('receive-message', (roomId, message, userId, userName) => {
      setMessages(prev => ({
        ...prev,
        [roomId]: [
          ...(prev[roomId] || []),
          {
            id: Date.now(),
            text: message,
            sender: userName,
            userId: userId,
            timestamp: new Date().toLocaleTimeString()
          }
        ]
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [collaboratedTasks]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  const startVideoCall = (task) => {
    setActiveCall(task);
  };

  const startChat = (task) => {
    setActiveChat(task);
  };

  const endVideoCall = () => {
    setActiveCall(null);
  };

  const endChat = () => {
    setActiveChat(null);
  };

  const sendMessage = () => {
    if (newMessage.trim() === '' || !socket || !activeChat) return;
    
    // Send message through socket
    socket.emit('send-message', activeChat._id, newMessage, socket.id, user?.name || 'You');
    setNewMessage('');
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Phone className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Connect</h1>
            <p className="text-gray-600">Video call and chat with your collaborators</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 p-4 bg-white rounded-xl border border-purple-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
          </div>
          
          <div className="flex gap-2">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  sortBy === opt.id 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCollaboratedTasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users className="text-purple-600 w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No collaborated tasks yet</h3>
            <p className="text-gray-600">Tasks assigned to you by others will appear here</p>
          </div>
        ) : (
          sortedCollaboratedTasks.map(task => (
            <div key={task._id} className="bg-white rounded-xl border border-purple-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 truncate">{task.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'High' ? 'bg-red-100 text-red-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => startChat(task)}
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startVideoCall(task)}
                      className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Modal */}
      {activeChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl h-[70vh] flex flex-col">
            {/* Chat Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Chat: {activeChat.title}
              </h2>
              <button 
                onClick={endChat}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {(messages[activeChat._id] || []).length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <div className="space-y-3">
                  {(messages[activeChat._id] || []).map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.userId === socket?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.userId === socket?.id 
                            ? 'bg-purple-500 text-white rounded-br-none' 
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        {message.userId !== socket?.id && (
                          <div className="text-xs font-semibold mb-1">{message.sender}</div>
                        )}
                        <div>{message.text}</div>
                        <div className={`text-xs mt-1 ${message.userId === socket?.id ? 'text-purple-200' : 'text-gray-500'}`}>
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                  onClick={sendMessage}
                  className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {activeCall && (
        <VideoCall
          taskId={activeCall._id}
          taskTitle={activeCall.title}
          onClose={endVideoCall}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default ConnectPage;