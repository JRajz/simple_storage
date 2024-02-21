const { DirectoryService } = require('../services');
const { Response } = require('../utilities');

class DirectoryController {
  static async create(req, res, next) {
    try {
      const params = { ...req.body };
      params.creatorId = req.user.userId;

      const srvRes = await DirectoryService.create(params);

      Response.success(res, srvRes, 'Directories created successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const directories = await DirectoryService.getAll(req.user.userId);

      const message = directories ? 'Directories retrieved successfully' : 'No directories found';

      Response.success(res, directories, message);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DirectoryController;
