const fs = require('fs');
const path = require('path');
const {
  UserService,
  FileService,
  DirectoryService,
  FileMapService,
  FileAccessService,
  FileVersionService,
} = require('../services');
const { Response, Message, fileHashGenerator, Logger } = require('../utilities');

class FileController {
  // Validate and process file data before insertion
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

      // Prepare file parameters for insertion
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
      // If any error occurs, unlink the file to prevent storage leaks
      await fs.promises.unlink(fileData.file.path);
      throw err;
    }
  }

  static async uploadToRoot(req, res, next) {
    try {
      const fileData = req.body;
      const fileParams = await FileController._validateAndProcessFile(fileData, req.user.userId, null);

      // Insert file into database
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

      // Check if the directory exists and user has permission to upload
      await DirectoryService.checkDirectoryExistence({ directoryId, creatorId: req.user.userId });

      const fileParams = await FileController._validateAndProcessFile(fileData, req.user.userId, directoryId);

      // Insert file into database
      const fileRes = await FileMapService.insert(fileParams);
      Response.success(res, fileRes, Message.FILE_UPLOADED);
    } catch (err) {
      next(err);
    }
  }

  static async downloadFile(req, res, next) {
    try {
      const { id } = req.params;

      // Fetch file details
      const file = await FileMapService.getById(id);

      // Check user permission to access the file
      if (file.accessType === 'private' && file.creatorId !== req.user.userId) {
        throw Response.createError(Message.ACCESS_DENIED);
      } else if (file.accessType === 'partial') {
        // Check file permission file access
        await FileAccessService.checkUserFileAccess({ id, userId: req.user.userId });
      }

      // Check if the file exists
      await fs.promises.access(file.filePath, fs.constants.R_OK);

      // Create a readable stream to read the file
      const fileStream = fs.createReadStream(file.filePath);
      // Handle streaming errors
      fileStream.on('error', (err) => {
        Logger.error('Error streaming file:', err);
        throw Response.createError(Message.GENERIC_ERROR, err);
      });

      // Set response headers for file download
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

      // Check file existence and user permission
      const file = await FileMapService.getById(params.id);
      if (file.creatorId !== req.user.userId) {
        throw Response.createError(Message.ACCESS_DENIED);
      }

      // Update file metadata
      const srvRes = await FileMapService.updateMetaData(params);
      Response.success(res, srvRes, 'MetaData updated');
    } catch (err) {
      next(err);
    }
  }

  // Delete file
  static async delete(req, res, next) {
    try {
      const { id } = { ...req.params };

      const params = {
        id,
        creatorId: req.user.userId,
      };

      // Check file existence and user permission
      const file = await FileMapService.getById(id);
      if (file.creatorId !== params.creatorId) {
        throw Response.createError(Message.ACCESS_DENIED);
      }

      const srvRes = await FileMapService.delete(params);
      Response.success(res, srvRes, 'File deleted');
    } catch (err) {
      next(err);
    }
  }

  // File version operations
  // Get all versions of a file
  static async getFileVersions(req, res, next) {
    try {
      const { id } = req.params;

      const fileRes = await FileVersionService.getAll(id);
      Response.success(res, fileRes, fileRes ? 'Version file(s) found' : 'No  versions found for this file');
    } catch (err) {
      next(err);
    }
  }

  // Upload a new version of a file
  static async uploadVersion(req, res, next) {
    try {
      const fileData = req.body;
      const { id } = req.params;

      // Check file existence and user permission
      const existingFile = await FileMapService.getById(id, true);
      if (existingFile.creatorId !== req.user.userId) {
        throw Response.createError(Message.ACCESS_DENIED);
      }

      const fileParams = await FileController._validateAndProcessFile(
        fileData,
        req.user.userId,
        existingFile.directoryId,
      );

      // Check if the uploaded version is a duplicate
      if (fileParams.fileHash === existingFile.fileHash) {
        throw Response.createError(Message.DUPLICATE_FILE);
      } else {
        await FileVersionService.checkHashKeyExists(id, fileParams.fileHash);
      }

      // Insert new version
      const fileRes = await FileVersionService.insert(fileParams, existingFile);
      Response.success(res, fileRes, Message.FILE_VERSION_UPLOADED);
    } catch (err) {
      next(err);
    }
  }

  // Restore a specific version of a file
  static async restoreVersion(req, res, next) {
    try {
      const { id, versionId } = req.params;

      // Check file existence and user permission
      const existingFile = await FileMapService.getById(id, true);
      if (existingFile.creatorId !== req.user.userId) {
        throw Response.createError(Message.ACCESS_DENIED);
      }

      // Check if the version exists and restore it
      const version = await FileVersionService.checkFileVersion({ id, versionId });
      await FileVersionService.restore(version);

      Response.success(res, {}, Message.VERSION_RESTORED);
    } catch (err) {
      next(err);
    }
  }

  // File Access operations
  static async setAccess(req, res, next) {
    try {
      const { id } = req.params;
      const { accessType, allowedUserIds = [] } = req.body;

      // Check file existence and user permission
      const existingFile = await FileMapService.getById(id);
      if (existingFile.creatorId !== req.user.userId) {
        throw Response.createError(Message.ACCESS_DENIED);
      }

      if (allowedUserIds) {
        await UserService.validateUserIds(allowedUserIds);
      }

      await FileAccessService.setAccess({ accessType, allowedUserIds, file: existingFile });
      Response.success(res, {}, Message.FILE_ACCESS_UPDATED);
    } catch (err) {
      next(err);
    }
  }

  static async removeUserAccess(req, res, next) {
    try {
      const { id, userId } = req.params;

      // Check file existence and user permission
      const existingFile = await FileMapService.getById(id);
      if (existingFile.creatorId !== req.user.userId) {
        throw Response.createError(Message.ACCESS_DENIED);
      } else if (existingFile.accessType !== 'partial') {
        throw Response.createError(Message.ACCESS_DENIED);
      }

      await FileAccessService.removeUserAccess({ id, userId });
      Response.success(res, {}, Message.FILE_ACCESS_UPDATED);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = FileController;
