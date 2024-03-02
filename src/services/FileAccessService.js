const Sequelize = require('sequelize');

const { models, sequelize } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');

class FileAccessService {
  /**
   * Checks if a specific user has access to a file.
   *
   * @param {Object} options - An object containing the following properties:
   *   - id: ID of the file
   *   - userId: ID of the user
   * @returns {Promise<boolean>} Resolves with true if the user has access, throws error otherwise.
   */
  static async checkUserFileAccess({ id, userId }) {
    try {
      Logger.info('FileAccessService: Checking user file access', { id, userId });

      const user = await models.fileAccess.findOne({
        where: { fileMapId: id, userId },
        attributes: ['userId'],
      });

      if (!user) {
        throw Response.createError(Message.FILE_ACCESS_DENIED);
      }
    } catch (error) {
      Logger.error('FileAccessService: Error checking user file access', { id, userId });
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Sets access permissions for a file.
   *
   * @param {Object} options - An object containing the following properties:
   *   - accessType: File access type
   *   - allowedUserIds: Array of user IDs with access
   *   - file: File object
   * @returns {Promise<boolean>} Resolves with true if access is set successfully, throws error otherwise.
   */
  static async setAccess({ accessType, allowedUserIds, file }) {
    try {
      Logger.info('FileAccessService: Setting file access', {
        fileMapId: file.id,
        accessType,
        allowedUserIds,
      });

      const existingUserIds = [];

      // Start a transaction to ensure atomicity
      await sequelize.transaction(async (transaction) => {
        // update the file access

        await models.fileMap.update({ accessType }, { where: { id: file.id }, transaction });

        // Fetch existing access user IDs
        const accessData = await models.fileAccess.findAll({
          where: { fileMapId: file.id },
          attributes: ['userId'],
          transaction,
        });

        // Extract existing user IDs
        for (const user of accessData) {
          existingUserIds.push(user.userId);
        }

        // Identify unselected user IDs for removal
        const deleteAccessUserIds = existingUserIds.filter((userId) => !allowedUserIds.includes(userId));

        // Identify new user IDs to be added
        const newAccessUserIds = allowedUserIds.filter(
          (userId) => !existingUserIds.includes(userId) && userId !== file.creatorId,
        );

        // Remove unselected user access
        if (deleteAccessUserIds.length > 0) {
          await models.fileAccess.destroy({
            where: { fileMapId: file.id, userId: { [Sequelize.Op.in]: deleteAccessUserIds } },
            transaction,
          });
        }

        // Create access records for newly allowed users
        if (newAccessUserIds) {
          const newAccessData = newAccessUserIds.map((userId) => ({ fileMapId: file.id, userId }));
          await models.fileAccess.bulkCreate(newAccessData, { transaction });
        }
      });

      Logger.info('FileAccessService: File access updated successfully', {
        fileMapId: file.id,
        accessType,
        allowedUserIds,
      });

      return true;
    } catch (error) {
      Logger.error('FileAccessService: Error setting file access', {
        fileMapId: file.id,
        accessType,
      });
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }

  /**
   * Removes access for a specific user from a file.
   *
   * @param {Object} options - An object containing the following properties:
   *   - id: ID of the file
   *   - userId: ID of the user
   * @returns {Promise<boolean>} Resolves with true if access is removed successfully, throws error otherwise.
   */
  static async removeUserAccess({ id, userId }) {
    try {
      Logger.info('FileAccessService: Remove user access from file', { id, userId });

      // Remoing user access from table
      await models.fileAccess.destroy({ where: { fileMapId: id, userId } });

      Logger.info('FileAccessService: Removed user access from file successfully', { id, userId });

      return true;
    } catch (error) {
      Logger.error('FileAccessService: Error removing user access from file.', { id, userId });
      throw Response.createError(Message.TRY_AGAIN, error);
    }
  }
}
module.exports = FileAccessService;
