const { Response, JwtToken, Message, redisClient } = require('../utilities');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Validate authorization header presence and format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw Response.createError(Message.INVALID_AUTHORIZATION_HEADER);
    }

    const token = authHeader.substring(7); // Extract token
    // Validate token presence
    if (!token) {
      throw Response.createError(Message.MISSING_TOKEN_IN_AUTHORIZATION_HEADER);
    }

    // Ensure JWT_SECRET is set securely in environment variables
    if (!process.env.JWT_SECRET) {
      throw Response.createError(Message.JWT_SECRET_NOT_SET);
    }

    const decoded = JwtToken.verifyToken(token);

    // Attach decoded user info to request for subsequent use (if applicable)
    req.user = decoded;

    // checking token exists in the redis
    const redisKey = `user_${decoded.userId}`;
    if (!(await redisClient.exists(redisKey))) {
      throw Response.createError(Message.INVALID_TOKEN);
    }

    next(); // Allow protected route access
  } catch (error) {
    // Handle errors centrally with appropriate HTTP status codes and informative messages
    next(error); // Pass errors to a custom error handler
  }
};

module.exports = authenticateToken;
