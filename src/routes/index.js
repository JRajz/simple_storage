const { Logger, Response } = require('../utilities');
const { authMiddleware } = require('../middlewares');
const { StatusService } = require('../services');

/* eslint-disable global-require */
exports.loadRoutes = (app) => {
  // checking server status
  app.get('/status', async (req, res, next) => {
    try {
      Logger.info('✅  Checking status', { status: 1 });

      const serviceStatus = await StatusService.getStatusData();

      const response = {
        server: {
          status: 'OK', // Indicate if the server is running normally
          timestamp: new Date(),
        },
        ...serviceStatus,
      };

      Response.success(res, response, 'Server is healthy.');
    } catch (err) {
      next(err);
    }
  });

  // Mount routes
  app.use('/users', require('./userRoutes'));

  app.use('/files', authMiddleware, require('./fileRoutes'));
  app.use('/directories', authMiddleware, require('./directoryRoutes'));
};
