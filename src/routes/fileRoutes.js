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

// Download routes
router.get('/:fileId/download', FileController.downloadFile);

// File Versioning
router.get('/:fileId/versions', FileController.downloadFile);

router.post('/:fileId/versions', FileController.downloadFile);

router.post('/:fileId/versions/revert/:id', FileController.downloadFile);

module.exports = router;
