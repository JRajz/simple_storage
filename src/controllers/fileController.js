const fs = require('fs');
const path = require('path');
const { FileService, DirectoryService, FileMapService } = require('../services');
const { Response, Message, fileHashGenerator, Logger } = require('../utilities');

class FileController {
  static async _uploadFile(file, creatorId, directoryId = null) {
    const checkParams = { directoryId, creatorId };

    // Generate a hash key from the file stream
    const fileHash = await fileHashGenerator.generateHashKey(file.path);

    // Check if the hash key already exists in the database
    const existingFile = await FileService.getByHashKey({ fileHash });
    if (existingFile) {
      await fs.promises.unlink(file.path); // Asynchronously remove the temporary file
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
      const { file } = req.body;

      const fileRes = await FileController._uploadFile(file, req.user.userId, null);
      Response.success(res, fileRes, Message.FILE_UPLOADED);
    } catch (err) {
      next(err);
    }
  }

  static async uploadToDirectory(req, res, next) {
    try {
      const { file } = req.body;
      const { directoryId } = req.params;

      await DirectoryService.checkDirectoryExistence({ directoryId, creatorId: req.user.userId });
      const fileRes = await FileController._uploadFile(file, req.user.userId, directoryId);

      Response.success(res, fileRes, Message.FILE_UPLOADED);
    } catch (err) {
      next(err);
    }
  }

  static async downloadFile(req, res, next) {
    try {
      // const { fileTypeId } = req.params;

      // Check if the hash key already exists in the database
      // const existingFile = await FileService.getFile({ fileTypeId });

      // Open a Readable stream to read data from a file
      // const fileStream = fs.createReadStream('../../uploads/2a8c99808c573d9f08fffe73a0e93d18.png');
      const filePath = '/home/mizig/Projects/air-tribe/simple_storage/uploads/2a8c99808c573d9f08fffe73a0e93d18.png';

      // Check if the file exists
      await fs.promises.access(filePath, fs.constants.R_OK);

      // Create a readable stream to read the file
      const fileStream = fs.createReadStream(filePath);
      // Handle errors during streaming
      fileStream.on('error', (err) => {
        Logger.error('Error streaming file:', err);
        throw Response.createError(Message.GENERIC_ERROR, err);
      });

      // Set the appropriate content type and attachment header for the file
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment; filename="newFile"');
      // Pipe the file stream to the response stream
      fileStream.pipe(res);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = FileController;
