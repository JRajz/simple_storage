const fs = require('fs').promises;
const Sequelize = require('sequelize');

const { models, sequelize } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');
const FileService = require('./FileService');

class FileMapService {
  /**
   * Fetches file details by ID.
   * @param {number} fileMapId - The ID of the file.
   * @param {boolean} masterFileId - Whether to include master file ID.
   * @returns {Promise<Object>} - Resolves with the file details.
   */
  static async getById(fileMapId, masterFileId = false) {
    try {
      Logger.info(`${this.constructor.name}: Check the entry `, { fileMapId });

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
        where: { id: fileMapId },
      });

      // Log if the file is not found
      if (!fileMapData) {
        throw Response.createError(Message.FILE_NOT_FOUND);
      }

      const { file, ...rest } = fileMapData.get({ plain: true });

      return { ...rest, ...file }; // Return the file record
    } catch (error) {
      Logger.error(`${this.constructor.name}: Error Checking file entry`, { fileMapId });
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Checks if a file with given attributes already exists.
   * @param {Object} whereClause - The attributes to check.
   * @returns {Promise<void>} - Throws an error if file already exists.
   */
  static async isUnique(whereClause) {
    if (!whereClause.directoryId) {
      // eslint-disable-next-line no-param-reassign
      whereClause.directoryId = null;
    }

    try {
      Logger.info(`${this.constructor.name}: Checking file exists`, whereClause);

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
      Logger.error(`${this.constructor.name}: File exists in directory`, error);
      throw error;
    }
  }

  /**
   * Inserts a new file record.
   * @param {Object} fileData - Data of the file to insert.
   * @returns {Promise<Object>} - Resolves with the inserted file's ID.
   */
  static async insert(fileData) {
    // Extract temporary file path from fileData
    const tempFilePath = fileData.filePath;

    try {
      Logger.info(`${this.constructor.name}: File Insertion`, fileData);

      // Destructure fileData to get relevant information
      const { directoryId, fileId, name, description, ...fileParams } = fileData;

      let file = {};
      let fileMap = {};

      // Start a transaction to ensure atomicity
      await sequelize.transaction(async (transaction) => {
        // If fileId is not provided, insert the file data
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

        // If fileId was generated, copy file from temporary location to permanent upload location
        if (!fileId) {
          await fs.copyFile(tempFilePath, file.filePath);
        }
      });

      // Cleanup temporary file
      await fs.unlink(tempFilePath);

      Logger.info(`${this.constructor.name}: File inserted successfully`);

      return { id: fileMap.id };
    } catch (error) {
      // Cleanup temporary file in case of error
      await fs.unlink(tempFilePath);

      // Handle errors and throw a formatted response
      Logger.error(`${this.constructor.name}: File insertion failed`, error);
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Updates metadata of a file.
   * @param {Object} payload - Updated metadata.
   * @returns {Promise<Object>} - Resolves with empty object upon successful update.
   */
  static async updateMetaData(payload) {
    try {
      Logger.info(`${this.constructor.name}: Update Meta data`, { payload });

      const { id, ...params } = payload;

      // Update metadata
      await models.fileMap.update(params, { where: { id } });

      return {}; // No specific data returned
    } catch (error) {
      Logger.error(`${this.constructor.name}: Failed to update Meta data`, error);
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Deletes a file.
   * @param {Object} options - Options for file deletion.
   * @returns {Promise<Object>} - Resolves with an empty object upon successful deletion.
   */
  static async delete({ id }) {
    try {
      Logger.info(`${this.constructor.name}: Delete File`, { id });

      await sequelize.transaction(async (transaction) => {
        await models.fileMap.destroy({ where: { id }, transaction });

        // Remove access and version
      });

      return {};
    } catch (error) {
      Logger.error(`${this.constructor.name}: Failed to delete file`, error);
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Fetches file details by ID.
   * @param {number} fileMapId - The ID of the file.
   * @param {boolean} masterFileId - Whether to include master file ID.
   * @returns {Promise<Object>} - Resolves with the file details.
   */
  static async getCreatorFilesByDirectory(params) {
    try {
      Logger.info(`${this.constructor.name}: Fetch creator files by directory`, params);

      const files = await models.fileMap.findAll({
        attributes: [
          'id',
          'directoryId',
          'creatorId',
          'name',
          'description',
          'accessType',
          'createdAt',
          'updatedAt',
          [sequelize.col('user.name'), 'creator_name'],
        ],
        include: [
          {
            model: models.file,
            attributes: [['fileSize', 'size'], ['fileType', 'type'], 'mimeType'],
          },
          {
            model: models.directory,
            attributes: ['name'],
          },
          {
            model: models.user,
            attributes: [],
          },
        ],
        where: params,
      });

      return { files, message: files ? 'Files retrieved successfully' : 'No files found' }; // Return the file record
    } catch (error) {
      Logger.error(`${this.constructor.name}: Error Fetching creator files by directory`, params);
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Searches for files matching a search query.
   * @param {Object} params - Search parameters.
   * @returns {Promise<Object>} - Resolves with search results.
   */
  static async searchFiles(params) {
    try {
      Logger.info(`${this.constructor.name}: Searching user files`, params);

      const { page, limit, search, userId } = params;

      const options = {
        attributes: [
          'id',
          'name',
          'description',
          'createdAt',
          'updatedAt',
          'creatorId',
          [sequelize.col('user.name'), 'creator_name'],
        ],
        include: [
          {
            model: models.file,
            attributes: [['fileSize', 'size'], ['fileType', 'type'], 'mimeType'],
          },
          {
            model: models.user,
            attributes: [],
          },
        ],
        where: {
          [Sequelize.Op.and]: [
            { creatorId: userId }, // Filter by user ID
            {
              // Search by name and description (case-insensitive)
              [Sequelize.Op.or]: [
                {
                  name: {
                    [Sequelize.Op.like]: `%${search.toLowerCase()}%`,
                  },
                },
                {
                  description: {
                    [Sequelize.Op.like]: `%${search.toLowerCase()}%`,
                  },
                },
              ],
            },
          ],
        },
        offset: (page - 1) * limit, // Apply pagination offset
        limit, // Set limit
      };

      const [rows, files] = await Promise.all([
        models.fileMap.count({ where: options.where }), // Count total matching rows
        models.fileMap.findAll(options), // Retrieve files with pagination
      ]);

      return { rows, files, message: files ? 'Files retrieved successfully' : 'No files found' };
    } catch (error) {
      Logger.error(`${this.constructor.name}: Error searching user files`, params);
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Retrieves files shared with a user.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Object>} - Resolves with shared files.
   */
  static async getSharedFiles(userId) {
    try {
      Logger.info(`${this.constructor.name}: Retrieving shared files for user`, userId);

      const files = await models.fileMap.findAll({
        attributes: [
          'id',
          'name',
          'description',
          'createdAt',
          'updatedAt',
          'creatorId',
          [sequelize.col('user.name'), 'creator_name'],
        ],
        include: [
          {
            model: models.file,
            attributes: [['fileSize', 'size'], ['fileType', 'type'], 'mimeType'],
          },
          {
            model: models.fileAccess,
            attributes: [],
            where: { userId },
          },
          {
            model: models.user,
            attributes: [],
          },
        ],
      });

      return { files, message: files ? 'Files retrieved successfully' : 'No files found' }; // Return the file record
    } catch (error) {
      Logger.error(`${this.constructor.name}: Error retrieving shared files for user`, userId);
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }
}
module.exports = FileMapService;
