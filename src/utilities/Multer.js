const multer = require('multer');
const os = require('os');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1000000, // Set a maximum file size limit (adjust as needed)
  },
});

module.exports = upload;
