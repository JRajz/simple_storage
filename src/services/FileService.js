const path = require('path');
const { models } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');

class FileService {
  // Get a file record by its hash key
  static async getByHashKey({ fileHash }) {
    try {
      Logger.info('FileService: Checking file hash', { fileHash });

      // Query the database to find a file with the given hash key
      const file = await models.file.findOne({
        attributes: ['fileId', 'fileName'],
        where: { fileHash },
      });

      // Log if the file is not found
      if (!file) {
        Logger.info('File not found', { fileHash });
      }

      return file; // Return the file record (or null if not found)
    } catch (error) {
      // Handle errors and throw a formatted response
      Logger.error('FileService: Error Checking file hash', { fileHash });
      throw Response.createError(Message.tryAgain, error);
    }
  }

  static async insert({ transaction, ...fileParams }) {
    try {
      Logger.info('FileService: Inserting file', fileParams);

      // Construct the permanent upload file path
      fileParams.filePath = path.resolve(__dirname, '../../uploads', fileParams.fileName);

      // Create the file record only if fileId is not provided
      const file = await models.file.create(fileParams, { transaction });

      return file;
    } catch (err) {
      Logger.error('FileService: File insertion failed', err);
      throw Response.createError(Message.tryAgain, err);
    }
  }
}
module.exports = FileService;
