const Redis = require('ioredis');
const logger = require('../services/logger');

const redisOptions = {
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  reconnectOnError: (err) => err.message.includes('READONLY'),
};

/**
 * Creates an isolated Redis client.
 * Call this twice: once for publishing, once for subscribing.
 * They MUST be separate connections because a subscribed client
 * cannot issue regular commands.
 */
const createRedisClient = (name = 'redis') => {
  const client = new Redis(process.env.REDIS_URL, redisOptions);

  client.on('connect', () => logger.info(`[${name}] Redis connected`));
  client.on('error', (err) => logger.error(`[${name}] Redis error: ${err.message}`));
  client.on('reconnecting', () => logger.warn(`[${name}] Redis reconnecting…`));

  return client;
};

module.exports = { createRedisClient };
