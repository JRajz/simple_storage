/* eslint-disable max-len */
const path = require('path');
const fs = require('fs').promises;
const { models, sequelize } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');
const FileMapService = require('./FileMapService');

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

  // Insert a new file record
  static async insert(fileData) {
    // Extract temporary file path from fileData
    const tempFilePath = fileData.filePath;

    try {
      Logger.info('FileService: Inserting file', fileData);

      // Destructure fileData to get relevant information
      const { directoryId, fileId, fileName, ...fileParams } = fileData;

      // Construct the permanent upload file path
      const uploadFilePath = path.resolve(__dirname, '../../uploads', fileName);

      let file = {}; // Placeholder for file record

      // Start a transaction to ensure atomicity
      await sequelize.transaction(async (transaction) => {
        if (!fileId) {
          // Add fileName to fileParams
          fileParams.fileName = fileName;

          // Set the new file path in the fileParams
          fileParams.filePath = uploadFilePath;

          // Create the file record only if fileId is not provided
          file = await models.file.create(fileParams, { transaction });

          // Copy file from temporary location to permanent upload location asynchronously
          await fs.copyFile(tempFilePath, uploadFilePath);

          // Delete the original file in the temporary directory asynchronously
          await fs.unlink(tempFilePath);
        }

        // Insert file mapping
        await FileMapService.insert({
          fileId: file.fileId || fileId, // Use fileId if provided, otherwise use newly created fileId
          directoryId,
          creatorId: fileParams.creatorId,
          transaction,
        });
      });

      Logger.info('FileService: File inserted successfully');

      return { fileId: file.fileId || fileId }; // Return the fileId of the inserted file
    } catch (error) {
      // Remove the file in the temporary directory in case of error
      await fs.unlink(tempFilePath);

      // Handle errors and throw a formatted response
      Logger.error('FileService: File insertion failed', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }
}
module.exports = FileService;
