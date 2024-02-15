const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Logger = require('./Logger');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const { userId } = req.user; // Assuming user information is available in the request
    const userUploadsDir = path.join(__dirname, '../../uploads', `${userId}`);

    // Ensure that the directory exists or create it if it doesn't
    // eslint-disable-next-line consistent-return
    fs.mkdir(userUploadsDir, { recursive: true }, (err) => {
      if (err) {
        // Handle any error occurred while creating the directory
        Logger.error('Error creating user uploads directory:', err);
        return cb(err);
      }
      cb(null, userUploadsDir);
    });
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
