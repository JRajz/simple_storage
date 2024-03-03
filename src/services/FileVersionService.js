const fs = require('fs').promises;
const Sequelize = require('sequelize');

const { models, sequelize } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');
const FileService = require('./FileService');

class FileVersionService {
  /**
   * Checks if a specific file version exists.
   * @param {Object} params - Parameters containing fileId and versionId.
   * @returns {Promise} - Resolves with the found version or throws an error if not found.
   */
  static async checkFileVersion({ id, versionId }) {
    try {
      Logger.info(`${this.constructor.name}: Verify file version`, { id, versionId });

      const version = await models.fileVersion.findOne({
        where: {
          versionId,
          fileMapId: id,
        },
      });

      // throw error if file exists in versions
      if (!version) {
        throw Response.createError(Message.DUPLICATE_VERSION_FILE);
      }

      return version;
    } catch (error) {
      Logger.error(`${this.constructor.name}: Error verify file version hashKey with version files`, { id, versionId });
      throw Response.createError(Message.TR, error);
    }
  }

  /**
   * Checks if a given hash key exists within any file versions associated with a file ID.
   *
   * @param {number} id - The ID of the file.
   * @param {string} hashKey - The hash key to search for.
   * @returns {Promise<number>} - The number of versions matching the hash key.
   * @throws {Error} - If an error occurs during the check.
   */
  static async checkHashKeyExists(id, hashKey) {
    try {
      Logger.info(`${this.constructor.name}: Check hashKey with version files`, { id, hashKey });

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
      Logger.error(`${this.constructor.name}: Error checking hashKey with version files`, { id, hashKey });
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Retrieves all file versions for a given file ID (fileMapId).
   *
   * @param {number} id - The ID of the file map.
   * @returns {Promise<Array<object>>} - An array of file version data objects.
   * @throws {Error} - If an error occurs during retrieval.
   */
  static async getAll(fileMapId) {
    try {
      Logger.info(`${this.constructor.name}: Fetch all file versions`, { fileMapId });

      const versionFiles = await models.fileVersion.findAll({
        attributes: [
          'versionId',
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
          fileMapId,
        },
        include: [
          {
            model: models.file,
            attributes: [],
          },
        ],
        order: [[sequelize.col('createdAt'), 'DESC']], // Order by createdAt descending
      });

      return versionFiles;
    } catch (error) {
      Logger.error(`${this.constructor.name}: Error fetch all file versions`, { fileMapId });
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Inserts a new file version.
   * @param {Object} fileData - Data of the file being inserted.
   * @param {Object} fileMapData - Data of the file map.
   * @returns {Promise} - Resolves with an empty object upon successful insertion or throws an error.
   */
  static async insert(fileData, fileMapData) {
    // Extract temporary file path from fileData
    const tempFilePath = fileData.filePath;

    try {
      Logger.info(`${this.constructor.name}: Version Insertion`, fileData);

      // Destructure fileData to get relevant information
      const { directoryId, fileId, name, description, ...fileParams } = fileData;

      let file = {};

      // Start a transaction to ensure atomicity
      await sequelize.transaction(async (transaction) => {
        // If fileId is not provided, insert the file data
        if (!fileId) {
          file = await FileService.insert({
            ...fileParams,
            transaction,
          });
        }

        // Create file version data
        const fileVersionData = {
          fileMapId: fileMapData.id,
          fileId: fileMapData.fileId,
          name: fileMapData.name,
          description: fileMapData.description,
        };
        // Insert file version
        await models.fileVersion.create(fileVersionData, { transaction });

        const updateData = {
          fileId: file.fileId || fileId,
          name,
          description,
        };

        // Update file map
        await models.fileMap.update(updateData, {
          where: {
            id: fileMapData.id,
          },
          transaction,
        });

        // If fileId was generated, copy file from temporary location to permanent upload location
        if (!fileId) {
          await fs.copyFile(tempFilePath, file.filePath);
        }
      });

      // Cleanup temporary file
      await fs.unlink(tempFilePath);

      Logger.info(`${this.constructor.name}: File version inserted successfully`);

      return {};
    } catch (error) {
      // Cleanup temporary file in case of error
      await fs.unlink(tempFilePath);

      // Handle errors and throw a formatted response
      Logger.error(`${this.constructor.name}: File version insertion failed`, error);
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Restores a specific file version.
   * @param {Object} version - Version data to be restored.
   * @returns {Promise} - Resolves with an empty object upon successful restoration or throws an error.
   */
  static async restore(version) {
    try {
      Logger.info(`${this.constructor.name}: Restore version`, version);

      const { fileMapId, versionId, fileId, name, description } = version;

      // Start a transaction to ensure atomicity
      await sequelize.transaction(async (transaction) => {
        // Update file map with version data
        await models.fileMap.update(
          {
            fileId,
            name,
            description,
          },
          {
            where: {
              id: fileMapId,
            },
            transaction,
          },
        );

        // Remove the restored version and any subsequent versions
        await models.fileVersion.destroy({
          where: {
            versionId: {
              [Sequelize.Op.gte]: versionId,
            },
          },
          transaction,
        });
      });
      Logger.info(`${this.constructor.name}: File restored successfully`);

      return {};
    } catch (error) {
      Logger.error(`${this.constructor.name}: Error restoring file version`, error);
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }
}
module.exports = FileVersionService;
