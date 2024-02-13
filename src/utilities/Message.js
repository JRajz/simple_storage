const { StatusCodes } = require('http-status-codes');

const Messages = {
  // Define your standard messages here
  GENERIC_ERROR: {
    code: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'An error occurred. Please try again later.',
  },
  INVALID_REQUEST: {
    code: StatusCodes.BAD_REQUEST,
    message: 'Invalid request. Please check your input.',
  },
  UNAUTHORIZED_ACCESS: {
    code: StatusCodes.UNAUTHORIZED,
    message: 'Unauthorized access. Please log in.',
  },
  NOT_FOUND: {
    code: StatusCodes.NOT_FOUND,
    message: 'Resource not found.',
  },
  FAILED_TO_GENERATE_TOKEN: {
    code: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Failed to generate token. Please try again later.',
  },
  TOKEN_EXPIRED: {
    code: StatusCodes.UNAUTHORIZED,
    message: 'Token has expired. Please request a new token.',
  },
  INVALID_TOKEN: {
    code: StatusCodes.UNAUTHORIZED,
    message: 'Invalid JWT token. Please provide a valid token.',
  },
  INVALID_AUTHORIZATION_HEADER: {
    code: StatusCodes.UNAUTHORIZED,
    message: 'Authorization header is missing or invalid. Please include a valid Bearer token.',
  },
  MISSING_TOKEN_IN_AUTHORIZATION_HEADER: {
    code: StatusCodes.UNAUTHORIZED,
    message: 'Token is missing in the Authorization header.',
  },
  JWT_SECRET_NOT_SET: {
    code: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'JWT_SECRET environment variable is not set.',
  },
  USER_ALREADY_EXISTS: {
    code: StatusCodes.BAD_REQUEST,
    message: 'User already exists.',
  },
  INVALID_CREDENTIALS: {
    code: StatusCodes.BAD_REQUEST,
    message: 'Invalid credentials.',
  },
  INCORRECT_PASSWORD: {
    code: StatusCodes.BAD_REQUEST,
    message: 'Incorrect password.',
  },
  // You can add more messages as needed
};

module.exports = Messages;
