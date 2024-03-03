const { Sequelize } = require('sequelize');

const { models } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');

class UserService {
  /**
   * Retrieves a user record by their ID.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Object>} - Resolves with the user record if found.
   * @throws {Error} - Throws an error if the user is not found.
   */
  static async getUserById(userId) {
    try {
      Logger.info('UserService: Getting user by ID', { userId });

      const user = await models.user.findByPk(userId, {
        attributes: ['userId', 'name', 'email'],
      });

      if (user) {
        return user;
      }

      Logger.error('User not found', { userId });

      throw Response.createError(Message.userNotFound);
    } catch (error) {
      Logger.error('UserService: Error getting user by ID', { userId });
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Validates an array of user IDs.
   * @param {Array<number>} userIds - An array of user IDs to validate.
   * @returns {Promise<boolean>} - Resolves with true if all user IDs are valid.
   * @throws {Error} - Throws an error if any user ID is invalid.
   */
  static async validateUserIds(userIds) {
    try {
      Logger.info('UserService: Validate userIds', { userIds });

      const validUsers = await models.user.findAll({
        where: {
          userId: {
            [Sequelize.Op.in]: userIds,
          },
        },
      });

      if (validUsers.length !== userIds.length) {
        const invalidUserIds = userIds.filter((id) => !validUsers.find((user) => user.userId === id));
        const customError = {
          message: `Invalid user IDs provided: ${invalidUserIds.join(', ')}`,
          statusCode: 400,
        };
        throw Response.createError(customError);
      }

      return true;
    } catch (error) {
      Logger.error('UserService: Error getting user by ID', error);
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Creates a new user.
   * @param {Object} userData - The data of the user to create.
   * @returns {Promise<Object>} - Resolves with the ID of the newly created user.
   * @throws {Error} - Throws an error if user creation fails.
   */
  static async createUser(userData) {
    try {
      Logger.info('UserService: Creating user');

      const newUser = await models.user.create(userData);

      Logger.info('User created successfully');

      return { userId: newUser.userId };
    } catch (error) {
      Logger.error('UserService: Error creating user', error);
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Checks if a user with the given email exists.
   * @param {string} email - The email to check for uniqueness.
   * @returns {Promise<Object|null>} - Resolves with the user record if found, null otherwise.
   * @throws {Error} - Throws an error if the operation fails.
   */
  static async checkUserByEmail(email, isPassword = false) {
    try {
      Logger.info('UserService: Checking uniqueness of email');

      let attributes = ['userId', 'name', 'email'];
      if (isPassword) {
        attributes = ['password', ...attributes];
      }

      const user = await models.user.findOne({
        attributes,
        where: { email },
      });
      return user;
    } catch (error) {
      Logger.error('UserService: Error checking email uniqueness', error);
      throw error;
    }
  }
}
module.exports = UserService;
