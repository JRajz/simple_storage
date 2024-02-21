const { StatusCodes } = require('http-status-codes');
const { isDev } = require('../config');

class Response {
  /**
   * Sends a successful response with optional data and message.
   * @param {Object} res - Express response object.
   * @param {*} data - Data to be sent in the response.
   * @param {string|Object} message - Message to be included in the response (optional).
   * Can be a string or an object containing `message` and `statusCode` properties.
   * @returns {Object} - Express response object.
   */
  static success(res, data, message = null) {
    let statusCode = StatusCodes.OK;
    let responseMessage = null;

    // Handle different message formats
    if (typeof message === 'string') {
      responseMessage = message;
    } else if (message && typeof message === 'object' && message.message) {
      responseMessage = message.message;
      statusCode = message.statusCode || StatusCodes.OK;
    }

    // Construct the response object
    const responseObject = {
      message: responseMessage,
      data: data || null,
      statusCode,
      success: true,
    };

    return res.status(statusCode).json(responseObject);
  }

  /**
   * Method for sending failure/error responses.
   * @param {Object} res - Express response object.
   * @param {string} message - Error message to be included in the response (optional).
   * @param {number} statusCode - HTTP status code (optional, default: 400).
   * @param {Error} error - Error object (optional).
   * @returns {Object} - Express response object.
   */
  static fail(res, message = 'Failed', statusCode = 400, error = null) {
    // Construct the error response object
    const responseObj = {
      success: false,
      message, // Set the message
      statusCode, // Set the status code
    };

    if (isDev && error) {
      // eslint-disable-next-line max-len
      responseObj.extra = error.stack || error; // Include error stack if available
    }

    // Send the response with the specified status code
    return res.status(statusCode).json(responseObj);
  }

  /**
   * Method for creating custom error objects.
   * @param {Object} type - Error type object.
   * @returns {Error} - Custom Error object.
   */
  static createError(type) {
    // Create a new Error object with the specified message
    const newError = new Error(type.message);

    // Set the error properties from the provided type object
    newError.message = type.message;
    newError.statusCode = type.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    newError.name = type.name || 'Error';
    return newError;
  }
}

module.exports = Response;
