// middleware/customErrorHandler.js
const { isCelebrateError } = require('celebrate');
const { StatusCodes } = require('http-status-codes');
const Response = require('../utilities/Response');

// eslint-disable-next-line no-unused-vars
function customErrorHandler(err, req, res, next) {
  // Handle Celebrate error
  if (isCelebrateError(err)) {
    let details = '';

    if (err.details.has('body')) {
      details = err.details.get('body');
    } else if (err.details.has('query')) {
      details = err.details.get('query');
    } else if (err.details.has('params')) {
      details = err.details.get('params');
    }

    const message = details ? details.message : 'Validation failed';

    return Response.fail(
      res,
      message,
      StatusCodes.UNPROCESSABLE_ENTITY,
      {
        errors: details ? details.details : null,
      },
    );
  }
  if (err.code) {
    return Response.fail(
      res,
      err.message,
      err.code,
      err,
    );
  }

  // Handle other errors
  return Response.fail(
    res,
    'Internal Server Error',
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
}

module.exports = customErrorHandler;
