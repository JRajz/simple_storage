const fs = require('fs').promises;
const { models, sequelize } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');
const FileService = require('./FileService');

class FileVersionService {
  static async checkHashKeyExists(id, hashKey) {
    try {
      Logger.info('FileVersionService: Check hashKey with version files', { id, hashKey });

      const count = await models.fileVersion.count({
        where: {
          fileMapId: id,
        },
        include: [
          {
            model: models.file,
            attributes: [], // Only include for joining purposes, no need to return attributes
            where: {
              '$file.fileHash$': hashKey,
            },
          },
        ],
      });

      // throw error if file exists in versions
      if (count > 0) {
        throw Response.createError(Message.DUPLICATE_VERSION_FILE);
      }

      return count;
    } catch (error) {
      Logger.error('FileVersionService: Error checking hashKey with version files', { id, hashKey });
      throw Response.createError(Message.TR, error);
    }
  }

  static async getAll(id) {
    try {
      Logger.info('FileVersionService: Fetch all file versions', { id });

      const versionFiles = await models.fileVersion.findAll({
        attributes: [
          'fileId',
          'name',
          'description',
          [sequelize.col('file.fileType'), 'fileType'],
          [sequelize.col('file.fileSize'), 'fileSize'],
          [sequelize.col('file.mimeType'), 'mimeType'],
          'createdAt',
          'updatedAt',
        ],
        where: {
          fileMapId: id,
        },
        include: [
          {
            model: models.file,
            attributes: [],
          },
        ],
      });

      return versionFiles;
    } catch (error) {
      Logger.error('FileVersionService: Error fetch all file versions', { id });
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  // Include new file version
  static async insert(fileData, fileMapData) {
    // Extract temporary file path from fileData
    const tempFilePath = fileData.filePath;

    try {
      Logger.info('FileVersionService: Version Insertion', fileData);

      // Destructure fileData to get relevant information
      const { directoryId, fileId, name, description, ...fileParams } = fileData;

      let file = {};

      // Start a transaction to ensure atomicity
      await sequelize.transaction(async (transaction) => {
        if (!fileId) {
          file = await FileService.insert({
            ...fileParams,
            transaction,
          });
        }

        const fileVersionData = {
          fileMapId: fileMapData.id,
          fileId: fileMapData.fileId,
          name: fileMapData.name,
          description: fileMapData.description,
        };
        await models.fileVersion.create(fileVersionData, { transaction });

        const updateData = {
          fileId: file.fileId || fileId,
          name,
          description,
        };

        // fileMapData.update
        // Insert file mapping
        await models.fileMap.update(updateData, {
          where: {
            id: fileMapData.id,
          },
          transaction,
        });

        if (!fileId) {
          // Copy file from temporary location to permanent upload location asynchronously
          await fs.copyFile(tempFilePath, file.filePath);
        }
      });

      await fs.unlink(tempFilePath); // Cleanup after successful insertion

      Logger.info('FileVersionService: File version inserted successfully');

      return { fileId: fileMapData.id };
    } catch (error) {
      // Remove the file in the temporary directory in case of error
      await fs.unlink(tempFilePath);

      // Handle errors and throw a formatted response
      Logger.error('FileVersionService: File version insertion failed', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }
}
module.exports = FileVersionService;
