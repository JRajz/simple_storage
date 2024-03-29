const { StatusCodes } = require('http-status-codes');

const Messages = {
  // Define your standard messages here
  GENERIC_ERROR: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'An error occurred. Please try again later.',
  },
  TRY_AGAIN: {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Please try again',
  },
  INVALID_REQUEST: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Invalid request. Please check your input.',
  },
  UNAUTHORIZED_ACCESS: {
    statusCode: StatusCodes.UNAUTHORIZED,
    message: 'Unauthorized access. Please log in.',
  },
  ACCESS_DENIED: {
    statusCode: StatusCodes.FORBIDDEN,
    message: 'You do not have the necessary permissions to perform this action.',
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
    statusCode: StatusCodes.CONFLICT,
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
  FILE_NOT_FOUND: {
    statusCode: StatusCodes.NOT_FOUND,
    message: 'File not found.',
  },
  FILE_EXISTS: {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'File already exists!',
  },
  FILE_UPLOADED: {
    statusCode: StatusCodes.CREATED,
    message: 'File uploaded succesfully',
  },
  INVALID_DIRECTORY: {
    statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
    message: 'Directory not found.',
  },
  INVALID_FILE: {
    statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
    message: 'Invalid file',
  },
  DUPLICATE_FILE: {
    statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
    message: 'Duplicate file',
  },
  DUPLICATE_VERSION_FILE: {
    statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
    message: 'File already exists in versions',
  },
  INVALID_VERSION_FILE: {
    statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
    message: 'Invalid version file',
  },
  VERSION_RESTORED: {
    statusCode: StatusCodes.OK,
    message: 'Version restored successfully',
  },
  FILE_ACCESS_UPDATED: {
    statusCode: StatusCodes.OK,
    message: 'File Access updated successfully',
  },
  FILE_ACCESS_DENIED: {
    statusCode: StatusCodes.FORBIDDEN,
    message: 'Access denied for the file',
  },
  DIRECTORY_ALREADY_EXISTS: {
    statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
    message: 'Duplicate directory name',
  },
  SIGNUP_SUCCESS: {
    statusCode: StatusCodes.CREATED,
    message: 'Signup successfull',
  },
  // You can add more messages as needed
};

module.exports = Messages;
