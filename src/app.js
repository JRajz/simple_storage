const express = require('express');

const { Logger } = require('./utilities');
const Config = require('./config');
const initLoader = require('./loaders');
const { sequelize } = require('./loaders/sequelize');

// eslint-disable-next-line
Logger.initLogger();

(async () => {
  try {
    // Initialize Express app
    const app = express();

    // Initialize loaders
    await initLoader({ expressApp: app });

    // Start the server
    app.listen(Config.Port, (err) => {
      if (err) {
        Logger.error('Unable to start server', err);
        process.exit(1);
      }

      Logger.info(`\n
      ################################################
      🛡️  Server listening on port: ${Config.Port} 🛡️
      ################################################\n\n`);
    });
  } catch (e) {
    Logger.error('.. Unable to start server', e);
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    Logger.info('Stopping server');

    await sequelize.close();

    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
});
