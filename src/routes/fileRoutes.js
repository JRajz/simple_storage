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
router.put('/:id', FileValidator.updateMetaData, FileController.updateMetaData);

// Delete file
router.delete('/:id', FileValidator.delete, FileController.delete);

// Download file
router.get('/:id/download', FileValidator.paramsFileId, FileController.downloadFile);

// File Versioning

// Route to get all versions of a file
router.get('/:id/versions', FileValidator.paramsFileId, FileController.getFileVersions);

// Route to upload a new version of a file
router.post('/upload/versions/:id', Multer.single('file'), FileValidator.uploadVersion, FileController.uploadVersion);

// Route to revert to a specific version of a file
router.post('/:id/revert/:versionId', FileValidator.versionRestore, FileController.restoreVersion);

// Route to set file access
router.post('/:id/access', FileValidator.setAccess, FileController.setAccess);

router.delete('/:id/access/:userId', FileValidator.removeUserAccess, FileController.removeUserAccess);

module.exports = router;
