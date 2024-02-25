const multer = require('multer');
const os = require('os');
const crypto = require('crypto');
const { Response, Message } = require('../utilities');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Store files in the temporary directory
    cb(null, os.tmpdir());
  },
  filename(req, file, cb) {
    // Generate unique filenames using crypto and original extension
    const randomBytes = crypto.randomBytes(16);
    const randomFilename = `${randomBytes.toString('hex')}.${file.originalname.split('.').pop()}`;
    // Generate unique filenames using timestamp and original name
    cb(null, randomFilename);
  },
});

// Create Multer upload instance
const upload = multer({ storage });

// Define middleware class for single file uploads
class MulterMiddleware {
  static single(name) {
    const middleware = upload.single(name);

    return (req, res, next) =>
      middleware(req, res, async (result) => {
        try {
          if (!req.file) {
            // Handle invalid file upload
            throw Response.createError(Message.INVALID_FILE);
          }

          // Attach file details to request body
          req.body[name] = req.file;

          next(result);
        } catch (e) {
          next(e);
        }
      });
  }
}

module.exports = MulterMiddleware;
