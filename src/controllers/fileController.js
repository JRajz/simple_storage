const fs = require('fs');
const path = require('path');
const { FileService, DirectoryService, FileMapService, FileVersionService } = require('../services');
const { Response, Message, fileHashGenerator, Logger } = require('../utilities');

class FileController {
  static async _validateAndProcessFile(fileData, creatorId, directoryId = null) {
    try {
      const { file, ...metaData } = fileData;
      const checkParams = { directoryId, creatorId };
      // Generate a hash key from the file stream
      const fileHash = await fileHashGenerator.generateHashKey(file.path);

      // Check if the hash key already exists in the database
      const existingFile = await FileService.getByHashKey({ fileHash });
      if (existingFile) {
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
        ...metaData,
        ...checkParams,
      };

      return fileParams;
    } catch (err) {
      await fs.promises.unlink(fileData.file.path);
      throw err;
    }
  }

  static async uploadToRoot(req, res, next) {
    try {
      const fileData = req.body;
      const fileParams = await FileController._validateAndProcessFile(fileData, req.user.userId, null);

      const fileRes = await FileMapService.insert(fileParams);
      Response.success(res, fileRes, Message.FILE_UPLOADED);
    } catch (err) {
      next(err);
    }
  }

  static async uploadToDirectory(req, res, next) {
    try {
      const fileData = req.body;
      const { directoryId } = req.params;

      await DirectoryService.checkDirectoryExistence({ directoryId, creatorId: req.user.userId });

      const fileParams = await FileController._validateAndProcessFile(fileData, req.user.userId, directoryId);

      const fileRes = await FileMapService.insert(fileParams);
      Response.success(res, fileRes, Message.FILE_UPLOADED);
    } catch (err) {
      next(err);
    }
  }

  static async downloadFile(req, res, next) {
    try {
      const { fileId } = req.params;

      const file = await FileMapService.getById(fileId);

      if (file.creatorId !== req.user.userId) {
        // check file permission
        throw Response.createError(Message.ACCESS_DENIED);
      }

      // Check if the file exists
      await fs.promises.access(file.filePath, fs.constants.R_OK);

      // Create a readable stream to read the file
      const fileStream = fs.createReadStream(file.filePath);
      // Handle errors during streaming
      fileStream.on('error', (err) => {
        Logger.error('Error streaming file:', err);
        throw Response.createError(Message.GENERIC_ERROR, err);
      });

      // Set the appropriate content type and attachment header for the file
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}.${file.fileType}"`);
      // Pipe the file stream to the response stream
      fileStream.pipe(res);
    } catch (err) {
      next(err);
    }
  }

  static async updateMetaData(req, res, next) {
    try {
      const params = { ...req.body, ...req.params };

      // check file
      const file = await FileMapService.getById(req.params.fileId);

      if (file.creatorId !== req.user.userId) {
        throw Response.createError(Message.ACCESS_DENIED);
      }

      const srvRes = await FileMapService.updateMetaData(params);

      Response.success(res, srvRes, 'MetaData updated');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const params = { ...req.params };
      params.creatorId = req.user.userId;

      await FileMapService.getById(req.params.fileId);

      const srvRes = await FileMapService.delete(params);

      Response.success(res, srvRes, 'File deleted');
    } catch (err) {
      next(err);
    }
  }

  // versions
  static async getFileVersions(req, res, next) {
    try {
      const { fileId } = req.params;

      const fileRes = await FileVersionService.getAll(fileId);

      Response.success(res, fileRes, fileRes ? 'Version file(s) found' : 'No  versions found for this file');
    } catch (err) {
      next(err);
    }
  }

  static async uploadVersion(req, res, next) {
    try {
      const fileData = req.body;
      const { fileId } = req.params;

      // Check if the file exists
      const existingFile = await FileMapService.getById(fileId, true);

      // Check if the user has permission to upload a new version of the file
      if (existingFile.creatorId !== req.user.userId) {
        throw Response.createError(Message.ACCESS_DENIED);
      }

      const fileParams = await FileController._validateAndProcessFile(
        fileData,
        req.user.userId,
        existingFile.directoryId,
      );

      // file hash check
      if (fileParams.fileHash === existingFile.fileHash) {
        throw Response.createError(Message.DUPLICATE_FILE);
      } else {
        await FileVersionService.checkHashKeyExists(fileId, fileParams.fileHash);
      }

      const fileRes = await FileVersionService.insert(fileParams, existingFile);

      Response.success(res, fileRes, Message.FILE_VERSION_UPLOADED);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = FileController;
