// backend/services/socket.service.js
// M4 — IMT Ilangasinghe
// Socket.io real-time engine for iQueue

const { Server } = require('socket.io');

let io = null;

/**
 * Initialise Socket.io with the HTTP server.
 * Called once from server.js by M1.
 * @param {import('http').Server} httpServer
 */
function init(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // A client can join a branch room so it only
    // receives events for its own branch.
    socket.on('join:branch', (branchId) => {
      socket.join(`branch:${branchId}`);
      console.log(`[Socket] ${socket.id} joined branch:${branchId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}

/**
 * Emit queue:updated — fires when a token is called or served.
 * Sends the full current queue for a branch.
 * @param {string} branchId
 * @param {Array}  queue  — array of token objects
 */
function emitQueueUpdated(branchId, queue) {
  if (!io) return;
  io.to(`branch:${branchId}`).emit('queue:updated', { branchId, queue });
}

/**
 * Emit token:called — fires when a specific customer's token is called.
 * The tracker page listens for this to update the customer's screen.
 * @param {string} branchId
 * @param {Object} token  — the token document that was just called
 */
function emitTokenCalled(branchId, token) {
  if (!io) return;
  io.to(`branch:${branchId}`).emit('token:called', { branchId, token });
}

/**
 * Emit token:booked — fires when a customer books a new token.
 * The staff panel listens for this so it knows a new person joined.
 * @param {string} branchId
 * @param {Object} token  — the newly created token document
 */
function emitTokenBooked(branchId, token) {
  if (!io) return;
  io.to(`branch:${branchId}`).emit('token:booked', { branchId, token });
}

/**
 * Emit token:served — fires when staff mark a token as served.
 * @param {string} branchId
 * @param {Object} token  — the token document just marked served
 */
function emitTokenServed(branchId, token) {
  if (!io) return;
  io.to(`branch:${branchId}`).emit('token:served', { branchId, token });
}

module.exports = {
  init,
  emitQueueUpdated,
  emitTokenCalled,
  emitTokenBooked,
  emitTokenServed,
};
