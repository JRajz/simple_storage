const router = require('express').Router();
const { DirectoryController } = require('../controllers');
const directoryValidator = require('../validators/directoryValidator');

router.get('/', DirectoryController.getAll);

router.post('/', directoryValidator.create, DirectoryController.create);

module.exports = router;
