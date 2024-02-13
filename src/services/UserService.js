const { Models } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');

class UserService {
  static async getUserById(userId) {
    try {
      Logger.info('UserService: Getting user by ID', { userId });

      const user = await Models.User.findByPk(userId);

      if (user) {
        return user;
      }

      Logger.debug('User not found', { userId });

      throw Response.createError(Message.userNotFound);
    } catch (error) {
      // if (error instanceof Sequelize.ValidationError) {
      //   // Handle validation errors separately
      //   Logger.error('UserService: Validation error creating user', error);
      //   throw new CustomError('Invalid user data', { code: 400 });
      // } else {
      //   Logger.error('UserService: Error getting user by ID', error);
      //   throw new CustomError('Something went wrong', { code: 500 });
      // }

      Logger.error('UserService: Error getting user by ID', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }

  static async createUser(userData) {
    try {
      Logger.info('UserService: Creating user');

      const newUser = await Models.user.create(userData);

      Logger.info('User created successfully');
      return newUser;
    } catch (error) {
      Logger.error('UserService: Error creating user', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }

  static async checkUserByEmail(email) {
    try {
      Logger.info('UserService: Checking uniqueness of email');

      const user = await Models.user.findOne({ where: { email } });

      return user;
    } catch (error) {
      Logger.error('UserService: Error checking email uniqueness', error);
      throw error;
    }
  }
}
module.exports = UserService;
