const mongoose = require('mongoose');

const dialogueSchema = new mongoose.Schema({
  role: { type: String, enum: ['ai', 'user'], required: true },
  content: { type: String, required: true },
  timeSpent: { type: Number, default: 0 },
  answerLength: { type: Number, default: 0 },
  fillerWords: { type: Number, default: 0 },
  feedback: {
    score: { type: Number, default: 0 },
    passesThreshold: { type: Boolean, default: false },
    starAnalysis: {
      situation: { type: String },
      task: { type: String },
      action: { type: String },
      result: { type: String }
    },
    improvement: { type: String },
    strengths: [String],
    suggestions: [String],
    criticalGaps: [String],
    difficultyLevel: { type: String },
    minimumThreshold: { type: Number },
    optimalThreshold: { type: Number },
    interviewType: { type: String },
    followUpQuestions: [String],
    communicationScore: { type: Number }
  }
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Started', 'In-Progress', 'Completed'], default: 'Started' },
  averageScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  thresholdPassRate: { type: Number, default: 0 },
  overallAssessment: { type: String, default: '' },
  jobDescription: { type: String, default: '' },
  questionCount: { type: Number, default: 5 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Expert'], default: 'Medium' },
  type: { type: String, enum: ['Technical', 'HR'], default: 'Technical' },
  metrics: {
    technicalDepth: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    experienceMatch: { type: Number, default: 0 },
    softSkills: { type: Number, default: 0 },
    thresholdCompliance: { type: String, default: '' }
  },
  performanceAnalysis: {
    weakAreas: [String],
    strongAreas: [String],
    recommendedPractice: [String],
    averageAnswerLength: { type: Number, default: 0 },
    averageTimePerQuestion: { type: Number, default: 0 },
    totalFillerWords: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 }
  },
  dialogue: [dialogueSchema]
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
