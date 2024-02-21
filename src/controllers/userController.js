const bcrypt = require('bcrypt');
const { Response, JwtToken, Message } = require('../utilities');
const { UserService } = require('../services');

// Controller function for user signup
// eslint-disable-next-line consistent-return
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
// eslint-disable-next-line consistent-return
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

    Response.success(res, { token }, 'Login Successful');
  } catch (err) {
    next(err);
  }
};
