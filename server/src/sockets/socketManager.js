const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { CHANNEL } = require('../services/incidentService');
const logger = require('../services/logger');

/**
 * initSockets
 * -----------
 * Sets up Socket.io on the HTTP server and subscribes to the
 * Redis Pub/Sub channel so that incident events published by
 * ANY server instance are fanned out to ALL connected clients.
 *
 * @param {http.Server}  httpServer
 * @param {ioredis}      subscriber  – dedicated Redis client (subscribe-only)
 * @param {string}       clientOrigin
 */
const initSockets = (httpServer, subscriber, clientOrigin) => {
  const io = new Server(httpServer, {
    cors: { origin: clientOrigin, methods: ['GET', 'POST'] },
    pingTimeout: 20000,
    pingInterval: 10000,
  });

  // ── JWT auth handshake ─────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ── Connection handler ────────────────────────────────────────
  io.on('connection', (socket) => {
    logger.info(`[socket] ${socket.user.username} connected (${socket.id})`);

    socket.join('warroom'); // everyone joins the global room

    socket.on('JOIN_INCIDENT', (incidentId) => {
      socket.join(`incident:${incidentId}`);
      logger.debug(`[socket] ${socket.user.username} joined incident:${incidentId}`);
    });

    socket.on('LEAVE_INCIDENT', (incidentId) => {
      socket.leave(`incident:${incidentId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`[socket] ${socket.user.username} disconnected – ${reason}`);
    });
  });

  // ── Redis → Socket.io bridge ──────────────────────────────────
  subscriber.subscribe(CHANNEL, (err) => {
    if (err) logger.error(`[redis-sub] Failed to subscribe: ${err.message}`);
    else logger.info(`[redis-sub] Subscribed to channel: ${CHANNEL}`);
  });

  subscriber.on('message', (channel, rawMessage) => {
    if (channel !== CHANNEL) return;
    try {
      const parsed = JSON.parse(rawMessage);
      // Broadcast to every connected client in the warroom room
      io.to('warroom').emit(parsed.event, parsed.payload);
      logger.debug(`[redis-sub] Broadcasted ${parsed.event}`);
    } catch (e) {
      logger.error(`[redis-sub] Failed to parse message: ${e.message}`);
    }
  });

  return io;
};

module.exports = { initSockets };
