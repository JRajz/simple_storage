const router = require('express').Router();
const { FileController } = require('../controllers');
const { Multer } = require('../middlewares');
const FileValidator = require('../validators/fileValidator');

// Route to get all files
router.get('/', FileValidator.getAll, FileController.getAll);

// Route to search files
router.get('/search', FileValidator.search, FileController.search);

// Route to get files shared with user
router.get('/shared', FileValidator.shared, FileController.getShared);

// Route for uploading a file
router.post('/upload', Multer.single('file'), FileValidator.upload, FileController.upload);

// Route to update file metadata
router.put('/:id', FileValidator.updateMetaData, FileController.updateMetaData);

// Route to delete a file
router.delete('/:id', FileValidator.delete, FileController.delete);

// Route to download a file
router.get('/:id/download', FileValidator.paramsFileId, FileController.downloadFile);

// File Versioning

// Route to get all versions of a file
router.get('/:id/versions', FileValidator.paramsFileId, FileController.getFileVersions);

// Route to upload a new version of a file
router.post('/upload/versions/:id', Multer.single('file'), FileValidator.uploadVersion, FileController.uploadVersion);

// Route to revert to a specific version of a file
router.post('/:id/revert/:versionId', FileValidator.versionRestore, FileController.restoreVersion);

// File Access

/// Route to set file access
router.post('/:id/access', FileValidator.setAccess, FileController.setAccess);

// Route to get access users for a file
router.get('/:id/access/users', FileValidator.paramsFileId, FileController.getAccessUsers);

// Route to remove access for a user from a file
router.delete('/:id/access/:userId', FileValidator.removeUserAccess, FileController.removeUserAccess);

module.exports = router;
