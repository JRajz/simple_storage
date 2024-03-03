const path = require('path');
const { models } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');

class FileService {
  /**
   * Retrieves a file record by its hash key.
   * @param {Object} options - An object containing the following property:
   *   - fileHash: The hash key of the file.
   * @returns {Promise<Object>} - Resolves with the file record if found, null otherwise.
   */
  static async getByHashKey({ fileHash }) {
    try {
      Logger.info(`${this.constructor.name}: Checking file hash`, { fileHash });

      // Query the database to find a file with the given hash key
      const file = await models.file.findOne({
        attributes: ['fileId', 'fileName'],
        where: { fileHash },
      });

      // Log if the file is not found
      if (!file) {
        Logger.info(`${this.constructor.name}: File not found`, { fileHash });
      }

      return file; // Return the file record (or null if not found)
    } catch (error) {
      // Handle errors and throw a formatted response
      Logger.error(`${this.constructor.name}: Error Checking file hash`, { fileHash });
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Inserts a new file record into the database.
   * @param {Object} options - An object containing the file parameters.
   * @returns {Promise<Object>} - Resolves with the inserted file record.
   */
  static async insert({ transaction, ...fileParams }) {
    try {
      Logger.info(`${this.constructor.name}: Inserting file`, fileParams);

      // Construct the permanent upload file path
      fileParams.filePath = path.resolve(__dirname, '../../uploads', fileParams.fileName);

      // Create the file record only if fileId is not provided
      const file = await models.file.create(fileParams, { transaction });

      return file;
    } catch (err) {
      Logger.error(`${this.constructor.name}: File insertion failed`, err);
      throw Response.createError(Message.TRY_AGAIN, err);
    }
  }
}
module.exports = FileService;
