const { DirectoryService } = require('../services');
const { Response } = require('../utilities');

class DirectoryController {
  static async create(req, res, next) {
    try {
      const params = {
        creatorId: req.user.userId,
        name: req.body.name,
        parentDirectoryId: req.body.directoryId,
      };

      const srvRes = await DirectoryService.create(params);

      Response.success(res, srvRes, 'Directory created successfully');
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const params = { ...req.body, ...req.params };
      params.creatorId = req.user.userId;

      const srvRes = await DirectoryService.update(params);

      Response.success(res, srvRes, 'Directory updated');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const params = { ...req.params };
      params.creatorId = req.user.userId;

      const srvRes = await DirectoryService.delete(params);

      Response.success(res, srvRes, 'Directory deleted');
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const params = {
        userId: req.user.userId,
        directoryId: req.query.directoryId,
      };
      const directories = await DirectoryService.getAll(params);

      const message = directories ? 'Directories retrieved successfully' : 'No directories found';
      Response.success(res, directories, message);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DirectoryController;
