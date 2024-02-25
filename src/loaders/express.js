const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const { StatusCodes } = require('http-status-codes');
const { errors } = require('celebrate');
const { customErrorHandler } = require('../middlewares');
const { Logger } = require('../utilities');
const router = require('../routes');

exports.loadModules = ({ app }) => {
  // Add security headers
  app.use(helmet());

  // HTTP request logger
  app.use(morgan('dev'));

  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Middleware that transforms the raw string of req.body into json
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Handle errors from 'celebrate'
  app.use(errors());

  // Load API routes
  router.loadRoutes(app);

  // Log received requests
  app.use((req, res, next) => {
    Logger.info(`Received ${req.method} request for ${req.url}`);
    next();
  });

  // Catch 404 and forward to error handler
  app.use((req, res, next) => {
    const error = new Error(`Route ${req.url} Not Found`);
    error.statusCode = StatusCodes.NOT_FOUND;
    next(error);
  });

  // error handlers
  // eslint-disable-next-line no-unused-vars
  // after all other middleware and routes
  app.use(customErrorHandler);
};
