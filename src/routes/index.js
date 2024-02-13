const { Logger, Response } = require('../utilities');

/* eslint-disable global-require */
exports.loadRoutes = (app) => {
  app.get('/status', (req, res) => {
    Logger.info('✅  Checking status', { status: 1 });

    Response.success(res, {});
  });

  // Mount routes
  app.use('/users', require('./userRoutes'));
};
