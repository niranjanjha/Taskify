import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, MessageCircle, X, Send } from 'lucide-react';
import io from 'socket.io-client';

const VideoCall = ({ taskId, taskTitle, onClose, currentUser }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [callStatus, setCallStatus] = useState('Initializing...');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const roomIdRef = useRef(taskId);
  const messagesEndRef = useRef(null);
  
  // Configuration for WebRTC
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize WebRTC and socket connection
  useEffect(() => {
    initializeVideoCall();
    
    return () => {
      cleanupVideoCall();
    };
  }, []);

  const initializeVideoCall = async () => {
    try {
      // Connect to signaling server
      socketRef.current = io('http://localhost:4000');
      
      // Set up socket event listeners
      socketRef.current.on('connect', () => {
        console.log('Connected to signaling server');
        setCallStatus('Joining call...');
        // Join the room for this task
        socketRef.current.emit('join-room', roomIdRef.current, socketRef.current.id);
      });
      
      socketRef.current.on('user-joined', (userId) => {
        console.log('User joined:', userId);
        setCallStatus('User joined the call');
        // Initiate call if we're the first user
        if (!isConnected) {
          initiateCall();
        }
      });
      
      // Handle WebRTC signaling
      socketRef.current.on('offer', async (offer, userId) => {
        console.log('Received offer from:', userId);
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socketRef.current.emit('answer', roomIdRef.current, answer, socketRef.current.id);
        }
      });
      
      socketRef.current.on('answer', async (answer, userId) => {
        console.log('Received answer from:', userId);
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setIsConnected(true);
          setCallStatus('Connected');
        }
      });
      
      socketRef.current.on('ice-candidate', async (candidate, userId) => {
        console.log('Received ICE candidate from:', userId);
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
      });
      
      // Handle chat messages
      socketRef.current.on('receive-message', (message, userId, userName) => {
        const newMsg = {
          id: Date.now(),
          text: message,
          sender: userName,
          userId: userId,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, newMsg]);
      });
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      localStreamRef.current = stream;
      
      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });
      
      // Set up event listeners for peer connection
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('ice-candidate', roomIdRef.current, event.candidate, socketRef.current.id);
        }
      };
      
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
          setCallStatus('Connected');
        }
      };
      
    } catch (error) {
      console.error('Error initializing video call:', error);
      setCallStatus('Failed to initialize call');
      alert('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const initiateCall = async () => {
    try {
      if (peerConnectionRef.current) {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socketRef.current.emit('offer', roomIdRef.current, offer, socketRef.current.id);
        setCallStatus('Calling...');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      setCallStatus('Failed to initiate call');
    }
  };

  const cleanupVideoCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    setIsConnected(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  const endCall = () => {
    cleanupVideoCall();
    onClose();
  };

  const sendMessage = () => {
    if (newMessage.trim() === '' || !socketRef.current) return;
    
    // Send message through socket
    socketRef.current.emit('send-message', roomIdRef.current, newMessage, socketRef.current.id, currentUser?.name || 'You');
    
    // Add message to local state immediately for better UX
    const newMsg = {
      id: Date.now(),
      text: newMessage,
      sender: currentUser?.name || 'You',
      userId: socketRef.current.id,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Connect: {taskTitle}
          </h2>
          <div className="text-sm text-gray-500">{callStatus}</div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Video area */}
          <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
            {/* Local video */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden flex-1">
              <video 
                ref={localVideoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                You
              </div>
            </div>
            
            {/* Remote video */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden flex-1">
              <video 
                ref={remoteVideoRef}
                autoPlay
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                Participant
              </div>
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                    <p>{callStatus}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat sidebar */}
          {showChat && (
            <div className="w-80 border-l flex flex-col bg-white">
              <div className="p-3 border-b">
                <h3 className="font-medium">Chat</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No messages yet. Start a conversation!</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map(message => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.userId === socketRef.current?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-full px-3 py-2 rounded-lg ${
                            message.userId === socketRef.current?.id 
                              ? 'bg-purple-500 text-white rounded-br-none' 
                              : 'bg-gray-200 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          {message.userId !== socketRef.current?.id && (
                            <div className="text-xs font-semibold mb-1">{message.sender}</div>
                          )}
                          <div className="text-sm">{message.text}</div>
                          <div className={`text-xs mt-1 ${message.userId === socketRef.current?.id ? 'text-purple-200' : 'text-gray-500'}`}>
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              <div className="p-3 border-t bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button 
                    onClick={sendMessage}
                    className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex justify-between items-center p-4 border-t">
          <div className="flex gap-2">
            <button 
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-full ${showChat ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200`}
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={toggleMute}
              className={`p-3 rounded-full ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={toggleVideo}
              className={`p-3 rounded-full ${isVideoOff ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={endCall}
              className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
          
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;