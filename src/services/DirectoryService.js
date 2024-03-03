const Sequelize = require('sequelize');

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
      Logger.info(`${this.constructor.name}: Directory existence check initiated`, { searchParams });

      // Find the directory based on search parameters
      const directory = await models.directory.findOne({
        attributes: ['directoryId', 'name', 'parentDirectoryId'],
        where: {
          ...searchParams,
        },
      });

      // Throw an error if directory not found
      if (!directory) {
        throw Response.createError(Message.INVALID_DIRECTORY);
      }

      return directory;
    } catch (error) {
      Logger.error(`${this.constructor.name}: Error occurred while checking directory existence`, { searchParams });
      throw error;
    }
  }

  /**
   * Checks if a directory name is unique within a parent directory.
   * @param {Object} payload - Payload containing directory name, parent directory ID, and optionally skip ID.
   * @returns {Promise<boolean>} - Returns false if name is unique, otherwise throws an error.
   */
  static async checkUniqueName({ name, parentDirectoryId, skipId = false }) {
    try {
      Logger.info(`${this.constructor.name}: Checking Unique name`, { name, parentDirectoryId, skipId });

      const where = { name, parentDirectoryId };
      // Exclude the directory with 'skipId' from the search
      if (skipId) {
        where.directoryId = { [Sequelize.Op.ne]: skipId };
      }

      // Find directory with the given name and parent directory
      const directory = await models.directory.findOne({
        attributes: ['directoryId', 'name'],
        where,
      });

      // Throw an error if directory with the same name already exists
      if (directory) {
        throw Response.createError(Message.DIRECTORY_ALREADY_EXISTS);
      }

      return false;
    } catch (error) {
      Logger.error(`${this.constructor.name}: Error Checking Unique name`, { name, parentDirectoryId, skipId });
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Retrieves all directories belonging to a user within a specific parent directory.
   * @param {Object} options - Options containing directory ID and user ID.
   * @returns {Promise<Array>} - Array of directories found.
   */
  static async getAll({ directoryId, userId }) {
    try {
      Logger.info(`${this.constructor.name}: Getting user directories`, { directoryId, userId });

      // Find all directories belonging to the user within the specified parent directory
      const directories = await models.directory.findAll({
        attributes: ['directoryId', 'name'],
        where: {
          parentDirectoryId: directoryId,
          creatorId: userId,
        },
      });

      // Log if directories found
      if (!directories) {
        Logger.info(`${this.constructor.name}: Directories found`, { directoryId, userId });
      }

      return directories;
    } catch (error) {
      Logger.error(`${this.constructor.name}: Error getting user directories`, error);
      throw Response.createError(Message.TRY_AGAIN, error);
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
      Logger.info(`${this.constructor.name}: Directory creation initiated`, payload);

      // Check if the directory name is unique
      await this.checkUniqueName(payload);

      // Create a new directory
      const newDirectory = await models.directory.create(payload);

      return { directoryId: newDirectory.directoryId };
    } catch (error) {
      Logger.error(`${this.constructor.name}: Failed to create directory`, payload);

      throw Response.createError(Message.TRY_AGAIN, error);
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
      Logger.info(`${this.constructor.name}: Directory update initiated`, payload);

      const { directoryId, creatorId, name } = payload;

      // Ensure directory exists and belongs to the user
      const { parentDirectoryId } = await this.checkDirectoryExistence({ directoryId, creatorId });

      // Check if the new directory name is unique
      await this.checkUniqueName({ name, parentDirectoryId, skipId: directoryId });

      // Update directory name
      await models.directory.update({ name }, { where: { directoryId } });

      return {}; // No specific data returned
    } catch (error) {
      Logger.error(`${this.constructor.name}: Failed to update directory`, payload);
      throw Response.createError(Message.TRY_AGAIN, error);
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
      Logger.info(`${this.constructor.name}: Directory deletion initiated`, payload);

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
        Logger.info(`${this.constructor.name}: Deleted files`, { deletedFilesCount });
      });

      return {};
    } catch (error) {
      Logger.error(`${this.constructor.name}: Failed to delete directory`, payload);
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }
}
module.exports = DirectoryService;
