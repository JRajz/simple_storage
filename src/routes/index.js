const { Logger, Response } = require('../utilities');
const { authMiddleware } = require('../middlewares');

/* eslint-disable global-require */
exports.loadRoutes = (app) => {
  app.get('/status', (req, res) => {
    Logger.info('✅  Checking status', { status: 1 });

    Response.success(res, {});
  });

  // Mount routes
  app.use('/users', require('./userRoutes'));

  app.use('/files', authMiddleware, require('./fileRoutes'));
  app.use('/directories', authMiddleware, require('./directoryRoutes'));
};
