const { sequelize, models } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');

/**
 * This class provides services for managing directories.
 */
class DirectoryService {
  /**
   * Checks if a directory exists based on given search parameters.
   *
   * @param {Object} searchParams - Parameters for searching directories (e.g., name, parent ID).
   * @returns {Promise<Object>} - The found directory or throws an error if not found.
   */
  static async checkDirectoryExistence(searchParams) {
    try {
      Logger.info('DirectoryService: Checking directory existence', { searchParams });

      const directory = await models.directory.findOne({
        attributes: ['directoryId', 'name'],
        where: {
          ...searchParams,
        },
      });

      if (!directory) {
        throw Response.createError(Message.INVALID_DIRECTORY);
      }

      return directory;
    } catch (error) {
      Logger.error('DirectoryService: Error checking directory existence', { error });
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

  /**
   * Creates a new directory with the provided details.
   *
   * @param {Object} payload - Data for the new directory (e.g., name, parent ID).
   * @returns {Promise<Object>} - An object containing the ID of the created directory.
   */
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

  /**
   * Updates an existing directory with new information.
   *
   * @param {Object} payload - Data for updating the directory (e.g., name, ID).
   * @returns {Promise<void>} - No content returned upon successful update.
   */
  static async update(payload) {
    try {
      Logger.info('DirectoryService: Update directory', { payload });

      const { directoryId, creatorId, name } = payload;

      // Ensure directory exists and belongs to the user
      await this.checkDirectoryExistence({ directoryId, creatorId });

      // Update directory
      await models.directory.update({ name }, { where: { directoryId } });

      return {}; // No specific data returned
    } catch (error) {
      Logger.error('DirectoryService: Failed to update directory', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }

  /**
   * Deletes a directory and its associated files (soft delete).
   *
   * @param {Object} payload - Data identifying the directory to delete (e.g., ID).
   * @returns {Promise<Object>} - An object containing a success message.
   */
  static async delete(payload) {
    try {
      Logger.info('DirectoryService: Delete directory', { payload });

      const { directoryId } = payload;

      // Check if directory exists
      const existingDirectory = await this.checkDirectoryExistence(payload);

      await sequelize.transaction(async (transaction) => {
        // Soft delete directory (set deletedAt timestamp)
        await existingDirectory.destroy({ transaction });

        // Delete associated files (consider checking deleted rows here)
        const deletedFilesCount = await models.fileMap.destroy({
          where: { directoryId },
          transaction,
        });
        Logger.info('DirectoryService: Deleted files', { deletedFilesCount });
      });

      return {};
    } catch (error) {
      Logger.error('DirectoryService: Failed to delete directory', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }
}
module.exports = DirectoryService;
