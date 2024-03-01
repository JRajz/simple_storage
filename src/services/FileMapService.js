const fs = require('fs').promises;
const { models, sequelize } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');
const FileService = require('./FileService');

class FileMapService {
  // get file by id
  static async getById(fileId, masterFileId = false) {
    try {
      Logger.info('FileMapService: Check the entry ', { fileId });

      let masterAttributes = ['filePath', 'fileSize', 'fileType', 'fileHash'];
      if (masterFileId) {
        masterAttributes = ['fileId', ...masterAttributes];
      }

      const fileMapData = await models.fileMap.findOne({
        attributes: ['id', 'directoryId', 'creatorId', 'name', 'description', 'accessType', 'createdAt', 'updatedAt'],
        include: [
          {
            model: models.file,
            attributes: masterAttributes,
          },
        ],
        where: { id: fileId },
      });

      // Log if the file is not found
      if (!fileMapData) {
        throw Response.createError(Message.FILE_NOT_FOUND);
      }

      const { file, ...rest } = fileMapData.get({ plain: true });

      return { ...rest, ...file }; // Return the file record
    } catch (error) {
      Logger.error('FileMapService: Error Checking file entry', { fileId });
      throw Response.createError(Message.tryAgain, error);
    }
  }

  static async isUnique(whereClause) {
    if (!whereClause.directoryId) {
      // eslint-disable-next-line no-param-reassign
      whereClause.directoryId = null;
    }

    try {
      Logger.info('FileMappingService: Checking file exists', whereClause);

      const fileMap = await models.fileMap.findOne({
        attributes: ['id', 'name'],
        where: {
          ...whereClause,
        },
      });

      if (fileMap) {
        throw Response.createError(Message.DUPLICATE_FILE);
      }
    } catch (error) {
      Logger.error('FileMappingService: File exists in directory', error);
      throw error;
    }
  }

  // Insert a new file record
  static async insert(fileData) {
    // Extract temporary file path from fileData
    const tempFilePath = fileData.filePath;

    try {
      Logger.info('FileMappingService: File Insertion', fileData);

      // Destructure fileData to get relevant information
      const { directoryId, fileId, name, description, ...fileParams } = fileData;

      let file = {};
      let fileMap = {};

      // Start a transaction to ensure atomicity
      await sequelize.transaction(async (transaction) => {
        if (!fileId) {
          file = await FileService.insert({
            ...fileParams,
            transaction,
          });
        }

        // Insert file mapping
        fileMap = await models.fileMap.create(
          {
            fileId: file.fileId || fileId, // Use fileId if provided, otherwise use newly created fileId
            directoryId,
            name,
            description,
            accessType: 'Private',
            creatorId: fileParams.creatorId,
            transaction,
          },
          { transaction },
        );

        // Insert file Access
        await models.fileAccess.create(
          {
            fileMapId: fileMap.id,
            userId: fileParams.creatorId,
          },
          {
            transaction,
          },
        );

        if (!fileId) {
          // Copy file from temporary location to permanent upload location asynchronously
          await fs.copyFile(tempFilePath, file.filePath);
        }
      });

      await fs.unlink(tempFilePath); // Cleanup after successful insertion

      Logger.info('FileMappingService: File inserted successfully');

      return { fileId: fileMap.fileId };
    } catch (error) {
      // Remove the file in the temporary directory in case of error
      await fs.unlink(tempFilePath);

      // Handle errors and throw a formatted response
      Logger.error('FileMappingService: File insertion failed', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }

  static async updateMetaData(payload) {
    try {
      Logger.info('FileMapService: Update Meta data', { payload });

      const { fileId, ...params } = payload;

      // Update metadata
      await models.fileMap.update(params, { where: { id: fileId } });

      return {}; // No specific data returned
    } catch (error) {
      Logger.error('FileMapService: Failed to update Meta data', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }

  static async delete({ fileId }) {
    try {
      Logger.info('FileService: Delete File', { fileId });

      await sequelize.transaction(async (transaction) => {
        // Soft delete directory (set deletedAt timestamp)
        await models.fileMap.destroy({ where: { fileId }, transaction });

        // // Delete associated files (consider checking deleted rows here)
        // const deletedFilesCount = await models.fileMap.destroy({
        //   where: { directoryId },
        //   transaction,
        // });

        // Remove access and version
      });

      return {};
    } catch (error) {
      Logger.error('DirectoryService: Failed to delete file', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }
}
module.exports = FileMapService;
