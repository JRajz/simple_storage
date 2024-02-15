const { Models } = require('../loaders/sequelize');
const { Logger, Response, Message } = require('../utilities');

class FileService {
  static async getByHashKey({ hashKey }) {
    try {
      Logger.info('FileService: Checking file hash', { hashKey });

      const file = await Models.file.findOne({
        attributes: ['fileId', 'fileName'],
        where: { hashKey },
      });

      if (!file) {
        Logger.info('File not found', { hashKey });
      }

      return file;
    } catch (error) {
      Logger.error('FileService: Error Checking file hash', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }

  static async insert(fileData) {
    try {
      Logger.info('FileService: Inserting file', fileData);

      const file = await Models.file.create(fileData);

      Logger.info('FileService: File inserted successfully');
      return { data: file, message: 'File inserted successfully' };
    } catch (error) {
      Logger.error('FileService: File insertion failed', error);
      throw Response.createError(Message.tryAgain, error);
    }
  }
}
module.exports = FileService;
