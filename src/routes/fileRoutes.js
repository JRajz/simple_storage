const router = require('express').Router();
const { FileController } = require('../controllers');
const { Multer } = require('../middlewares');
const FileValidator = require('../validators/fileValidator');

// Route for uploading a file to the root directory
router.post('/upload', Multer.single('file'), FileValidator.upload, FileController.uploadToRoot);

// Route for uploading a file to a specific directory
router.post(
  '/upload/:directoryId',
  Multer.single('file'),
  FileValidator.directoryUpload,
  FileController.uploadToDirectory,
);

// Update file meta data
router.put('/:fileId', FileValidator.updateMetaData, FileController.updateMetaData);

// Delete file
router.delete('/:fileId', FileValidator.delete, FileController.delete);

// Download routes
router.get('/:fileId/download', FileValidator.paramsFileId, FileController.downloadFile);

// File Versioning
router.get('/:fileId/versions', FileValidator.paramsFileId, FileController.getFileVersions);

router.post(
  '/upload/versions/:fileId',
  Multer.single('file'),
  FileValidator.uploadVersion,
  FileController.uploadVersion,
);

// router.post('/:fileId/versions/revert/:id', FileValidator.versionRestore, FileController.getFileVersions);

module.exports = router;
