const fs = require('fs').promises;
const path = require('path');
const { FileService, DirectoryService, FileMapService } = require('../services');
const { Response, Message, fileHashGenerator } = require('../utilities');

class FileController {
  static async _uploadFile(file, creatorId, directoryId = null) {
    const checkParams = { directoryId, creatorId };

    // Generate a hash key from the file stream
    const fileHash = await fileHashGenerator.generateHashKey(file.path);

    // Check if the hash key already exists in the database
    const existingFile = await FileService.getByHashKey({ fileHash });
    if (existingFile) {
      await fs.unlink(file.path); // Asynchronously remove the temporary file
      checkParams.fileId = existingFile.fileId;
      await FileMapService.isUnique(checkParams);
    }

    const fileParams = {
      fileName: file.filename,
      filePath: file.path,
      fileHash,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileType: path.extname(file.originalname).substr(1),
      ...checkParams,
    };

    const fileRes = await FileService.insert(fileParams);
    return fileRes;
  }

  static async uploadToRoot(req, res, next) {
    try {
      const { file } = req;
      if (!file) {
        throw Response.createError(Message.INVALID_FILE);
      }

      const fileRes = await FileController._uploadFile(file, req.user.userId, null);
      Response.success(res, fileRes, Message.FILE_UPLOADED);
    } catch (err) {
      next(err);
    }
  }

  static async uploadToDirectory(req, res, next) {
    try {
      const { file, params: { directoryId } } = req;
      if (!file) {
        throw Response.createError(Message.INVALID_FILE);
      }

      await DirectoryService.checkDirectoryExistence({ directoryId, creatorId: req.user.userId });
      const fileRes = await FileController._uploadFile(file, req.user.userId, directoryId);

      Response.success(res, fileRes, Message.FILE_UPLOADED);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = FileController;
