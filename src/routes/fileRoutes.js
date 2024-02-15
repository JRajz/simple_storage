const router = require('express').Router();
const { FileController } = require('../controllers');
const { Multer } = require('../utilities');

// Route for file upload (requires authentication)
router.post('/upload', Multer.single('file'), FileController.upload);

module.exports = router;
