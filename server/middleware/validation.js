// Input validation middleware

exports.validateResume = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Resume file is required' });
  }

  // Check file type
  if (req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  // Check file size (max 5MB)
  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'File size must be less than 5MB' });
  }

  next();
};

exports.validateInterviewStart = (req, res, next) => {
  const { jobDescription, questionCount, difficulty, type } = req.body;

  // Validate question count
  if (questionCount && (questionCount < 1 || questionCount > 50)) {
    return res.status(400).json({ error: 'Question count must be between 1 and 50' });
  }

  // Validate difficulty
  const validDifficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
  if (difficulty && !validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty level' });
  }

  // Validate type
  const validTypes = ['Technical', 'HR'];
  if (type && !validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid interview type' });
  }

  // Validate job description length
  if (jobDescription && jobDescription.length > 5000) {
    return res.status(400).json({ error: 'Job description must be less than 5000 characters' });
  }

  next();
};

exports.validateAnswer = (req, res, next) => {
  const { answerText, questionIndex } = req.body;

  // Check if answer or audio is provided
  if (!answerText && !req.file) {
    return res.status(400).json({ error: 'Answer text or audio file is required' });
  }

  // Validate answer text length
  if (answerText && answerText.length > 10000) {
    return res.status(400).json({ error: 'Answer must be less than 10000 characters' });
  }

  // Validate question index
  if (questionIndex === undefined || questionIndex < 0) {
    return res.status(400).json({ error: 'Valid question index is required' });
  }

  next();
};

exports.validateAuth = (req, res, next) => {
  const { email, password, name } = req.body;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate password
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Validate name if provided
  if (name && name.length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  next();
};
