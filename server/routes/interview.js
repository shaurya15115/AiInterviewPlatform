const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const interviewController = require('../controllers/interviewController');
const auth = require('../middleware/auth');
const { validateResume, validateInterviewStart, validateAnswer } = require('../middleware/validation');

// Setup multer storage
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow specific file types
    const allowedMimes = ['application/pdf', 'audio/webm', 'audio/wav', 'audio/mpeg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF and audio files allowed.`), false);
    }
  }
});

router.post('/upload-resume', auth, upload.single('resume'), validateResume, interviewController.uploadResume);
router.post('/start', auth, validateInterviewStart, interviewController.startInterview);
router.post('/:id/evaluate', auth, upload.single('audio'), validateAnswer, interviewController.evaluateAnswer);
router.get('/', auth, interviewController.getInterviews);
router.get('/:id', auth, interviewController.getInterviewDetails);
router.delete('/:id', auth, interviewController.deleteInterview);

// Error handling for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({ error: 'File size exceeds 25MB limit' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
