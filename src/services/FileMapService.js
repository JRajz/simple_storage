const { models } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');

class FileService {
  static async isUnique(whereClause) {
    if (!whereClause.directoryId) {
      // eslint-disable-next-line no-param-reassign
      whereClause.directoryId = null;
    }

    try {
      Logger.info('FileMappingService: Checking file exists', whereClause);

      const fileMap = await models.filemap.findOne({
        attributes: ['fileMapId'],
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

  static async insert({ transaction, ...params }) {
    try {
      Logger.info('FileMappingService: Inserting file mapping', params);

      const insertData = {
        ...params,
        accessType: 'Private',
      };

      const fileMapping = await models.filemap.create(insertData, { transaction });

      Logger.info('FileMappingService: File mapping inserted successfully');

      return fileMapping;
    } catch (error) {
      Logger.error('FileMappingService: File mapping insertion failed', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }
}
module.exports = FileService;
