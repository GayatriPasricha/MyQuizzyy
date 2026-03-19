const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth');
const quizController = require('../controllers/quizController');

const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for disk storage to prevent V8/SSL memory crashes on Windows
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF files are allowed!'));
  }
});

const { requireAuth } = require('../middleware/auth');

// Create Quiz (Accepts PDF upload) - Requires Authentication
router.post('/generate', requireAuth, upload.single('file'), quizController.generateQuiz);

// Get all logged-in user's created quizzes
router.get('/user/my-quizzes', authMiddleware, quizController.getUserQuizzes);

// Get Quiz by shortId (Publicly accessible) - Move to bottom of primary GET routes
router.get('/:shortId', quizController.getQuizByShortId);

// Submit Quiz attempt (Publicly accessible but tracks user/guest)
router.post('/:shortId/attempt', authMiddleware, quizController.submitAttempt);

// Get attempts for a specific quiz (Creator view)
router.get('/:shortId/attempts', authMiddleware, quizController.getQuizAttempts);

module.exports = router;
