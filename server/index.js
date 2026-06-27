// server/index.js
// Production-ready backend
// Key change: PORT now reads from environment variable
// Render (and most cloud platforms) inject their own PORT at runtime

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Allows any frontend origin — fine for this project
    methods: ['GET', 'POST'],
  },
});

// Health check route
app.get('/', (req, res) => {
  res.send('Whiteboard server is running.');
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // ── JOIN ROOM ──
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.roomId = roomId;
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // ── DRAW ──
  socket.on('draw', (data) => {
    socket.to(data.roomId).emit('draw', data);
  });

  // ── CURSOR MOVE ──
  socket.on('cursor-move', (data) => {
    socket.to(data.roomId).emit('cursor-move', {
      socketId: socket.id,
      x: data.x,
      y: data.y,
    });
  });

  // ── DISCONNECT ──
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (socket.roomId) {
      socket.to(socket.roomId).emit('user-left', {
        socketId: socket.id,
      });
    }
  });
});

// ── PORT ──
// process.env.PORT is set automatically by Render in production
// If it's not set (local dev), fall back to 3001
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});