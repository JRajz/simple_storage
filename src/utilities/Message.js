const { StatusCodes } = require('http-status-codes');

const Messages = {
  // Define your standard messages here
  GENERIC_ERROR: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'An error occurred. Please try again later.',
  },
  INVALID_REQUEST: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Invalid request. Please check your input.',
  },
  UNAUTHORIZED_ACCESS: {
    statusCode: StatusCodes.UNAUTHORIZED,
    message: 'Unauthorized access. Please log in.',
  },
  NOT_FOUND: {
    statusCode: StatusCodes.NOT_FOUND,
    message: 'Resource not found.',
  },
  FAILED_TO_GENERATE_TOKEN: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Failed to generate token. Please try again later.',
  },
  TOKEN_EXPIRED: {
    statusCode: StatusCodes.UNAUTHORIZED,
    message: 'Token has expired. Please request a new token.',
  },
  INVALID_TOKEN: {
    statusCode: StatusCodes.UNAUTHORIZED,
    message: 'Invalid JWT token. Please provide a valid token.',
  },
  INVALID_AUTHORIZATION_HEADER: {
    statusCode: StatusCodes.UNAUTHORIZED,
    message: 'Authorization header is missing or invalid. Please include a valid Bearer token.',
  },
  MISSING_TOKEN_IN_AUTHORIZATION_HEADER: {
    statusCode: StatusCodes.UNAUTHORIZED,
    message: 'Token is missing in the Authorization header.',
  },
  JWT_SECRET_NOT_SET: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'JWT_SECRET environment variable is not set.',
  },
  USER_ALREADY_EXISTS: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'User already exists.',
  },
  INVALID_CREDENTIALS: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Invalid credentials.',
  },
  INCORRECT_PASSWORD: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Incorrect password.',
  },
  FILE_EXISTS: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'File already exists!',
  },
  // You can add more messages as needed
};

module.exports = Messages;
