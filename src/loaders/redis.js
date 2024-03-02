const { createClient } = require('redis');
const { REDIS } = require('../config');

// Define connection options with defaults
const redisOptions = {
  host: REDIS.HOST,
  port: REDIS.PORT,
  // Add other options like password, database selection, etc.
};

// Create a Promise-based Redis client
const redisClient = createClient(redisOptions);

module.exports = redisClient;
