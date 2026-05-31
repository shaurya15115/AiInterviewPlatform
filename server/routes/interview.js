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

const upload = multer({ storage: storage });

router.post('/upload-resume', auth, upload.single('resume'), validateResume, interviewController.uploadResume);
router.post('/start', auth, validateInterviewStart, interviewController.startInterview);
router.post('/:id/evaluate', auth, upload.single('audio'), validateAnswer, interviewController.evaluateAnswer);
router.get('/', auth, interviewController.getInterviews);
router.get('/:id', auth, interviewController.getInterviewDetails);
router.delete('/:id', auth, interviewController.deleteInterview);

module.exports = router;
