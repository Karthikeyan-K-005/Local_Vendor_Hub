// backend/middleware/uploadMiddleware.js
import multer from 'multer';

// Set up memory storage engine (for direct upload to Cloudinary)
const storage = multer.memoryStorage(); 

// Check file type: only allows common image extensions (JPEG/JPG/PNG)
function checkFileType(file, cb) {
  // Use file MIME type for a more reliable check
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Initialize Multer upload configuration
const upload = multer({
  storage: storage, // Use memory storage
  limits: { fileSize: 10000000 }, // Increased limit to 10MB (Cloudinary handles large files better)
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;