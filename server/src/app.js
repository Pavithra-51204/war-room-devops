require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const { createRedisClient } = require('./config/redis');
const { IncidentService } = require('./services/incidentService');
const { initSockets } = require('./sockets/socketManager');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const logger = require('./services/logger');

const authRoutes     = require('./routes/auth');
const incidentRoutes = require('./routes/incidents');

(async () => {
  // ── 1. Connect to MongoDB Atlas ──────────────────────────────
  await connectDB();

  // ── 2. Create Redis clients (publisher & subscriber) ─────────
  const publisher  = createRedisClient('publisher');
  const subscriber = createRedisClient('subscriber');
  await publisher.connect();
  await subscriber.connect();

  // ── 3. Express setup ─────────────────────────────────────────
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check (used by load-balancer / cloud health probes)
  app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

  // Attach incidentService to app.locals so routes can access it
  app.locals.incidentService = new IncidentService(publisher);

  // Routes
  app.use('/api/auth',      authRoutes);
  app.use('/api/incidents', incidentRoutes);

  // Error middleware (must be after routes)
  app.use(notFound);
  app.use(errorHandler);

  // ── 4. HTTP server + Socket.io ───────────────────────────────
  const httpServer = http.createServer(app);
  initSockets(httpServer, subscriber, process.env.CLIENT_ORIGIN || '*');

  // ── 5. Listen ────────────────────────────────────────────────
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () =>
    logger.info(`🚀  War Room server running on port ${PORT} [${process.env.NODE_ENV}]`)
  );

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received – shutting down…`);
    httpServer.close(async () => {
      await publisher.quit();
      await subscriber.quit();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
})();
