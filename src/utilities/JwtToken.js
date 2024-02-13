const jwt = require('jsonwebtoken');
const Logger = require('./Logger');
const Message = require('./Message');
const { createError } = require('./Response');

const secretKey = process.env.JWT_SECRET; // Ensure secure storage

class JWTManager {
  // eslint-disable-next-line no-shadow
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  /**
   * Creates a JWT token for the provided user data.
   *
   * @param {Object} payload - User data to include in the token.
   * @param {String} expiresIn - Optional expiration time in seconds (default: 1 hour).
   * @returns {String} The generated JWT token.
   */
  createToken(payload, expiresIn = 3600) {
    try {
      Logger.error('Generating token', payload);

      return jwt.sign(payload, this.secretKey, { expiresIn });
    } catch (err) {
      Logger.error(`${err.message}`, err);
      throw createError(Message.FAILED_TO_GENERATE_TOKEN);
    }
  }

  /**
   * Verifies a JWT token and returns the decoded user data.
   *
   * @param {String} token - The JWT token to verify.
   * @returns {Object} The decoded user data or throws an error on failure.
   */
  verifyToken(token) {
    try {
      // Attempt to decode and verify the token
      const decodedToken = jwt.verify(token, this.secretKey);

      // Log successful verification for auditing purposes
      Logger.info(`Token verification successful for user ${decodedToken.userId}`, { token });

      return decodedToken;
    } catch (err) {
      let errorType;
      if (err.name === 'TokenExpiredError') {
        errorType = Message.TOKEN_EXPIRED;
      } else if (err.name === 'JsonWebTokenError') {
        errorType = Message.INVALID_TOKEN;
      } else {
        errorType = { message: err.message, code: 400 };
      }

      Logger.info(`${errorType.message}`, { token });

      throw createError(errorType);
    }
  }
}

module.exports = new JWTManager(secretKey); // Create and export an instance
