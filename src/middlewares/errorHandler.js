const { isCelebrateError } = require('celebrate');
const multer = require('multer');
const { StatusCodes } = require('http-status-codes');
const Response = require('../utilities/Response');

// eslint-disable-next-line no-unused-vars
function customErrorHandler(err, req, res, next) {
  // Handle Multer error
  if (err instanceof multer.MulterError) {
    return Response.fail(res, 'File upload error', StatusCodes.BAD_REQUEST, err);
  }

  // Handle Celebrate error
  if (isCelebrateError(err)) {
    const details = err.details.get(err.details.keys().next().value);
    const message = details ? details.message : 'Validation failed';

    return Response.fail(res, message, StatusCodes.UNPROCESSABLE_ENTITY, {
      errors: details ? details.details : null,
    });
  }

  // Handle other errors
  if (err.statusCode) {
    return Response.fail(res, err.message, err.statusCode, err);
  }

  // Handle other errors
  return Response.fail(res, 'Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR, err);
}

module.exports = customErrorHandler;
