const { sequelize } = require('../loaders/sequelize');
const redisClient = require('../loaders/redis');

async function checkDatabaseStatus() {
  try {
    await sequelize.authenticate(); // Try to authenticate with the database
    return 'OK'; // If authentication succeeds, return 'OK'
  } catch (error) {
    return 'Error'; // If authentication fails, return 'Error'
  }
}

async function checkRedisStatus() {
  try {
    await redisClient.ping(); // Try to ping the Redis server
    return 'OK'; // If ping succeeds, return 'OK'
  } catch (error) {
    return 'Error'; // If ping fails, return 'Error'
  }
}

async function getStatusData() {
  try {
    const databaseStatus = await checkDatabaseStatus();
    const redisStatus = await checkRedisStatus();

    return {
      database: {
        status: databaseStatus,
        lastChecked: new Date(),
      },
      redis: {
        status: redisStatus,
        lastChecked: new Date(),
      },
    };
  } catch (error) {
    throw new Error('Failed to fetch status data');
  }
}

module.exports = { getStatusData };
