const User = require('../models/User');
const Interview = require('../models/Interview');
const AIService = require('../services/AIService');
const fs = require('fs');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No resume uploaded' });

    const pdfBuffer = fs.readFileSync(req.file.path);
    const parsedData = await AIService.parseResume(pdfBuffer);

    const user = await User.findById(req.userId);
    user.resumeData = parsedData;
    await user.save();

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ message: 'Resume parsed successfully', resumeData: parsedData });
  } catch (error) {
    console.error("Upload Resume Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.startInterview = async (req, res) => {
  try {
    const { jobDescription, questionCount = 5, difficulty = 'Medium', type = 'Technical' } = req.body;
    const user = await User.findById(req.userId);
    if (!user.resumeData || !user.resumeData.rawText) {
      return res.status(400).json({ error: 'Please upload a resume first' });
    }

    const generatedQuestions = await AIService.generateQuestions(user.resumeData, jobDescription, questionCount, difficulty, type);
    
    // Create interview record
    const interview = new Interview({
      userId: req.userId,
      jobDescription: jobDescription,
      questionCount: questionCount,
      difficulty: difficulty,
      type: type,
      dialogue: generatedQuestions.map(q => ({
        role: 'ai',
        content: q.content
      }))
    });

    await interview.save();
    res.json({ interviewId: interview._id, questions: generatedQuestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.evaluateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionIndex, timeSpent = 0 } = req.body;
    
    let answerText = req.body.answerText;
    
    if (req.file) {
      answerText = await AIService.transcribeAudio(req.file.path);
      fs.unlinkSync(req.file.path);
    }

    if (!answerText) {
      return res.status(400).json({ error: 'No answer provided (audio or text required)' });
    }

    const interview = await Interview.findById(id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const question = interview.dialogue[questionIndex].content;
    
    // Analyze answer quality
    const answerAnalysis = AIService.analyzeAnswerQuality(answerText);
    
    const evaluation = await AIService.evaluateResponse(
      question, 
      answerText, 
      interview.difficulty,
      questionIndex,
      interview.questionCount,
      interview.type
    );

    // Add communication score from analysis
    evaluation.communicationScore = answerAnalysis.communicationScore;

    // Get previous answer context for follow-up generation
    let previousContext = null;
    if (questionIndex > 0) {
      const previousAnswer = interview.dialogue.find((d, idx) => idx === questionIndex * 2 - 1 && d.role === 'user');
      if (previousAnswer) {
        previousContext = `Previous answer: ${previousAnswer.content.substring(0, 200)}...`;
      }
    }

    // Generate follow-up questions (40% chance - realistic interview behavior)
    const followUpQuestions = await AIService.generateFollowUpQuestions(
      question,
      answerText,
      interview.type,
      interview.difficulty,
      previousContext
    );

    interview.dialogue.push({
      role: 'user',
      content: answerText,
      timeSpent: timeSpent,
      answerLength: answerText.length,
      fillerWords: answerAnalysis.fillerWords,
      feedback: {
        score: evaluation.score,
        passesThreshold: evaluation.passesThreshold,
        starAnalysis: evaluation.starAnalysis,
        improvement: evaluation.improvement,
        criticalGaps: evaluation.criticalGaps,
        strengths: evaluation.strengths,
        suggestions: evaluation.suggestions,
        difficultyLevel: evaluation.difficultyLevel,
        minimumThreshold: evaluation.minimumThreshold,
        optimalThreshold: evaluation.optimalThreshold,
        interviewType: evaluation.interviewType,
        followUpQuestions: followUpQuestions,
        communicationScore: evaluation.communicationScore
      }
    });

    const userAnswers = interview.dialogue.filter(d => d.role === 'user');
    const totalScore = userAnswers.reduce((sum, ans) => sum + ans.feedback.score, 0);
    const passedThresholdCount = userAnswers.filter(ans => ans.feedback.passesThreshold).length;
    
    interview.totalScore = totalScore;
    interview.averageScore = Math.round(totalScore / userAnswers.length);
    interview.thresholdPassRate = (passedThresholdCount / userAnswers.length) * 100;

    interview.metrics = {
      technicalDepth: Math.min(30, evaluation.score),
      clarity: evaluation.score >= evaluation.minimumThreshold ? Math.min(30, evaluation.score + 2) : Math.max(0, evaluation.score - 3),
      confidence: evaluation.score >= evaluation.optimalThreshold ? Math.min(30, evaluation.score + 1) : Math.max(0, evaluation.score - 2),
      experienceMatch: Math.min(30, evaluation.score + 3),
      softSkills: Math.min(30, evaluation.score + 2),
      thresholdCompliance: evaluation.passesThreshold ? 'Pass' : 'Below Threshold'
    };

    if (userAnswers.length >= interview.questionCount) {
      interview.status = 'Completed';
      
      const finalPassRate = interview.thresholdPassRate;
      if (finalPassRate === 100) {
        interview.overallAssessment = 'Excellent - All answers met or exceeded standards';
      } else if (finalPassRate >= 80) {
        interview.overallAssessment = 'Good - Most answers met standards';
      } else if (finalPassRate >= 60) {
        interview.overallAssessment = 'Acceptable - Some answers below standards';
      } else {
        interview.overallAssessment = 'Needs Improvement - Most answers below standards';
      }

      // Generate performance analysis
      interview.performanceAnalysis = AIService.generatePerformanceAnalysis(
        interview.dialogue,
        interview.difficulty,
        interview.type
      );
    }

    await interview.save();

    res.json({
      transcription: answerText,
      evaluation,
      followUpQuestions: followUpQuestions,
      averageScore: interview.averageScore,
      thresholdPassRate: interview.thresholdPassRate,
      status: interview.status,
      overallAssessment: interview.overallAssessment,
      performanceAnalysis: interview.performanceAnalysis,
      answerAnalysis: answerAnalysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInterviewDetails = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.userId });
    if (!interview) return res.status(404).json({ error: 'Not found' });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
