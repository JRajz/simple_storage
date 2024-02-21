const { models } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');

class DirectoryService {
  static async check(params) {
    try {
      Logger.info('DirectoryService: Checking directory', { params });

      const directory = await models.directory.findOne({
        attributes: ['directoryId', 'name'],
        where: {
          ...params,
        },
      });

      if (!directory) {
        throw Response.createError(Message.INVALID_DIRECTORY);
      }

      return directory;
    } catch (error) {
      Logger.error('DirectoryService: Error Checking file hash', { params });
      throw error;
    }
  }

  static async getAll(userId) {
    try {
      Logger.info('DirectoryService: Getting user directories', { userId });

      const where = {
        parentDirectoryId: null,
        creatorId: userId, // Filter by user ID
      };

      const directories = await models.directory.findAll({
        attributes: ['directoryId', 'name'],
        where,
      });

      if (!directories) {
        Logger.info('DirectoryService: Directories found', { userId });
      }

      return directories;
    } catch (error) {
      Logger.error('DirectoryService: Error getting user directories', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }

  static async create(payload) {
    try {
      Logger.info('DirectoryService: Create directory', { payload });

      const newDirectory = await models.directory.create(payload);

      return { directoryId: newDirectory.directoryId };
    } catch (error) {
      Logger.error('DirectoryService: Failed to create directory', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }
}
module.exports = DirectoryService;
