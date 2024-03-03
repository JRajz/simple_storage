const router = require('express').Router();
const { DirectoryController } = require('../controllers');
const directoryValidator = require('../validators/directoryValidator');

// Route to get all directories
router.get('/', directoryValidator.getAll, DirectoryController.getAll);

// Route to create a new directory
router.post('/', directoryValidator.create, DirectoryController.create);

// Route to update an existing directory
router.put('/:directoryId', directoryValidator.update, DirectoryController.update);

// Route to delete a directory
router.delete('/:directoryId', directoryValidator.delete, DirectoryController.delete);

module.exports = router;
