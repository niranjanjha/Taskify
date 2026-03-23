import { Server } from 'socket.io';

let io;

const debugSocket = process.env.DEBUG_SOCKET_IO === 'true';

export const initializeVideoCallService = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    if (debugSocket) console.log('[socket] connected', socket.id);

    // Join a room for a specific task
    socket.on('join-room', (roomId, userId) => {
      if (debugSocket) console.log(`[socket] join-room`, roomId, userId);
      socket.join(roomId);
      // Notify others in the room that a user has joined
      socket.to(roomId).emit('user-joined', userId);
    });

    // Handle WebRTC signaling
    socket.on('offer', (roomId, offer, userId) => {
      if (debugSocket) console.log('[socket] offer', roomId, userId);
      socket.to(roomId).emit('offer', offer, userId);
    });

    socket.on('answer', (roomId, answer, userId) => {
      if (debugSocket) console.log('[socket] answer', roomId, userId);
      socket.to(roomId).emit('answer', answer, userId);
    });

    socket.on('ice-candidate', (roomId, candidate, userId) => {
      if (debugSocket) console.log('[socket] ice-candidate', roomId, userId);
      socket.to(roomId).emit('ice-candidate', candidate, userId);
    });

    // Handle chat messages
    socket.on('send-message', (roomId, message, userId, userName) => {
      if (debugSocket) console.log('[socket] message', roomId, userName);
      // Broadcast message to all users in the room except sender
      socket.to(roomId).emit('receive-message', roomId, message, userId, userName);
      
      // Also send confirmation to sender
      socket.emit('receive-message', roomId, message, userId, userName);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      if (debugSocket) console.log('[socket] disconnected', socket.id);
    });
  });

  console.log('Video call service initialized');
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};