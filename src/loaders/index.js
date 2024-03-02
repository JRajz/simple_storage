const expressLoader = require('./express');
const { sequelize } = require('./sequelize');
const redisClient = require('./redis');
const { Logger } = require('../utilities');

// Loader function to initialize Express and Sequelize
const loader = async ({ expressApp }) => {
  try {
    // Synchronous operation
    Logger.info('🔄  Starting database authentication...');
    sequelize.authenticate();

    // Await asynchronous operation
    await sequelize.sync();
    Logger.info('✅  Database synchronization complete!');

    // Connect to Redis
    Logger.info('🔄  Connecting to Redis server...');
    await redisClient.connect();
    Logger.info('✅ Connected to Redis server!');

    // Load Express modules
    await expressLoader.loadModules({ app: expressApp });
    Logger.info('✌️  Express loaded');
  } catch (error) {
    Logger.error('❌  Error occurred during loading:', error);
    // Handle error appropriately, e.g., throw it or exit the process
    throw error;
  }
};

module.exports = loader;
