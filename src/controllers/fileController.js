const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { StatusCodes } = require('http-status-codes');
const { FileService } = require('../services');
const { Response, Message, Logger } = require('../utilities');

// generate the file hash key
async function generateHashKey(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (error) => reject(error));
  });
}
// eslint-disable-next-line consistent-return
async function upload(req, res, next) {
  try {
    const { file } = req;

    // Generate a hash key from the file stream
    const hashKey = await generateHashKey(file.path); // Implement your logic here

    // Check if the hash key already exists in the database
    const existingFile = await FileService.getByHashKey({ hashKey });
    if (existingFile) {
      fs.unlinkSync(file.path);
      throw Response.createError(Message.FILE_EXISTS);
    }

    const fileParams = {
      fileName: req.file.filename,
      filePath: req.file.path,
      hashKey,
      size: req.file.size,
      mimeType: req.file.mimetype,
      fileType: path.extname(req.file.originalname).substr(1),
      creatorId: req.user.userId,
    };

    const fileRes = await FileService.insert(fileParams);

    return Response.success(res, fileRes, StatusCodes.CREATED);
  } catch (error) {
    Logger.error('Failed to upload file: ', error);
    next(error);
  }
}

module.exports = { upload };
