const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = ALLOWED_TYPES[file.mimetype] || '.bin';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
      return cb(Object.assign(new Error('Only JPG, PNG, WEBP or GIF images are allowed'), { status: 400 }));
    }
    cb(null, true);
  },
});

// Turns an uploaded file into a public URL path
const publicPath = (file) => `/uploads/${file.filename}`;

module.exports = { upload, publicPath, UPLOAD_DIR };
