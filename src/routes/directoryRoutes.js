const router = require('express').Router();
const { DirectoryController } = require('../controllers');
const directoryValidator = require('../validators/directoryValidator');

router.get('/', DirectoryController.getAll);

router.post('/', directoryValidator.create, DirectoryController.create);

router.put('/:directoryId', directoryValidator.update, DirectoryController.update);

router.delete('/:directoryId', directoryValidator.delete, DirectoryController.delete);

module.exports = router;
