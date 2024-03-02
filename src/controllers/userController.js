const bcrypt = require('bcrypt');
const { Response, JwtToken, Message, redisClient } = require('../utilities');
const { UserService } = require('../services');

// Controller function for user signup
exports.signUp = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const isPresent = await UserService.checkUserByEmail(email);
    if (isPresent) {
      throw Response.createError(Message.USER_ALREADY_EXISTS);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const userRes = await UserService.createUser({ name, email, password: hashedPassword });

    // Return success response
    Response.success(res, userRes, Message.USER_CREATED_SUCCESSFULLY);
  } catch (err) {
    next(err);
  }
};

// Controller function for user signin
exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await UserService.checkUserByEmail(email);
    if (!user) {
      throw Response.createError(Message.INVALID_CREDENTIALS);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw Response.createError(Message.INCORRECT_PASSWORD);
    }

    // Create JWT token
    const payload = { userId: user.userId };

    const token = JwtToken.createToken(payload);

    const redisKey = `user_${user.userId}`;
    const tokenExpirationTime = 60 * 60; // Store for 1 hour
    await redisClient.set(redisKey, token, {
      EX: tokenExpirationTime,
      NX: true,
    });

    Response.success(res, { token }, 'Login Successful');
  } catch (err) {
    next(err);
  }
};

// Logout
exports.signOut = async (req, res, next) => {
  try {
    const redisKey = `user_${req.user.userId}`;
    await redisClient.del(redisKey);

    Response.success(res, {}, 'Logout Successful');
  } catch (err) {
    next(err);
  }
};
