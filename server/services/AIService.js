const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  static async parseResume(pdfBuffer) {
    try {
      const data = await pdfParse(pdfBuffer);
      const rawText = data.text;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an expert technical recruiter. Extract the candidate's core information from the provided resume text.
            Return a JSON object strictly matching this schema:
            {
              "skills": ["skill1", "skill2"],
              "experience": ["Company A - Role - Impact", "Company B - Role - Impact"],
              "projects": ["Project A - Tech - Impact"],
              "rawText": "summarized brief text"
            }`
          },
          {
            role: 'user',
            content: rawText
          }
        ]
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("Resume parsing error:", error);
      throw new Error("Failed to parse resume with AI");
    }
  }

  static async generateQuestions(resumeData, jobDescription, questionCount = 5, difficulty = 'Medium', type = 'Technical') {
    try {
      let systemPrompt;
      
      if (type === 'HR') {
        systemPrompt = `You are an expert HR and behavioral interviewer conducting real-world interviews. Generate ${questionCount} realistic behavioral and HR questions that assess soft skills, cultural fit, communication, and past experiences. 

IMPORTANT RULES:
- Vary question types: Don't repeat similar questions
- Mix different topics: teamwork, leadership, conflict, learning, motivation, communication, adaptability
- Base questions on candidate's actual experience from resume
- Make questions conversational and natural
- Avoid generic questions
- Each question should be unique in approach

QUESTION VARIETY (distribute across these):
- Team collaboration and conflict resolution (1-2 questions)
- Leadership and initiative (1-2 questions)
- Adaptability and learning from failures (1 question)
- Communication and interpersonal skills (1 question)
- Career goals and motivation (1 question)
- Work-life balance and values alignment (optional)

Return a JSON object strictly matching this schema:
{
  "questions": [
    {
      "role": "ai",
      "content": "The generated behavioral/HR question"
    }
  ]
}`;
      } else {
        // Technical questions with difficulty-aware generation
        let difficultyGuidance = '';
        if (difficulty === 'Easy') {
          difficultyGuidance = `EASY LEVEL - Focus on:
- Fundamental concepts from their tech stack
- Basic problem-solving (not complex algorithms)
- Explaining what they've built (not how to build from scratch)
- Understanding of core technologies they've used
- Simple design decisions they've made
- Basic debugging or troubleshooting scenarios`;
        } else if (difficulty === 'Medium') {
          difficultyGuidance = `MEDIUM LEVEL - Focus on:
- Intermediate problem-solving
- System design basics
- Trade-offs and optimization
- Real-world scenarios from their experience
- Handling edge cases
- Performance considerations`;
        } else if (difficulty === 'Hard') {
          difficultyGuidance = `HARD LEVEL - Focus on:
- Complex system design
- Advanced algorithms and data structures
- Optimization and scalability
- Architectural decisions
- Handling complex edge cases
- Performance at scale`;
        } else {
          difficultyGuidance = `EXPERT LEVEL - Focus on:
- Cutting-edge system design
- Complex distributed systems
- Advanced optimization techniques
- Strategic architectural decisions
- Handling extreme scale scenarios
- Novel problem-solving approaches`;
        }

        systemPrompt = `You are an expert technical interviewer conducting real-world technical interviews. Generate ${questionCount} contextual technical interview questions based on the candidate's skills and experience.

${difficultyGuidance}

IMPORTANT RULES:
- Vary question types: Don't repeat similar questions
- Mix different topics: coding, system design, debugging, architecture, optimization
- Base questions on candidate's actual tech stack and projects
- Make questions realistic and practical
- Avoid generic "implement X" questions
- Each question should be unique in approach and topic
- For Easy: Ask about what they've built, not complex algorithms
- For Medium/Hard: Ask about design decisions, trade-offs, optimization
- Reference their actual experience when possible

QUESTION VARIETY (distribute across these):
- Coding/Problem-solving (1-2 questions)
- System design or architecture (1 question)
- Debugging or optimization (1 question)
- Technology-specific questions (1 question)
- Real-world scenario from their experience (1 question)

Return a JSON object strictly matching this schema:
{
  "questions": [
    {
      "role": "ai",
      "content": "The generated technical question"
    }
  ]
}`;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Resume Data: ${JSON.stringify(resumeData)}\nJob Description: ${jobDescription}\nDifficulty: ${difficulty}\n\nGenerate ${questionCount} unique, varied questions. Do NOT repeat similar questions. Base them on the candidate's actual experience. Make them realistic interview questions.`
          }
        ]
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      return parsed.questions;
    } catch (error) {
      console.error("Question generation error:", error);
      throw new Error("Failed to generate questions");
    }
  }

  static async evaluateResponse(question, answerText, difficulty = 'Medium', questionIndex = 0, totalQuestions = 5, interviewType = 'Technical') {
    try {
      const difficultyThresholds = {
        'Easy': { minScore: 15, optimalScore: 22 },
        'Medium': { minScore: 20, optimalScore: 27 },
        'Hard': { minScore: 22, optimalScore: 29 },
        'Expert': { minScore: 24, optimalScore: 29 }
      };

      const thresholds = difficultyThresholds[difficulty] || difficultyThresholds['Medium'];

      let evaluationPrompt;
      
      if (interviewType === 'HR') {
        evaluationPrompt = `You are an expert HR interviewer evaluating a candidate's behavioral response. Assess the answer based on:
- Clarity and communication effectiveness
- Authenticity and self-awareness
- Relevant examples and storytelling
- Alignment with company values
- Growth mindset and learning ability
- Emotional intelligence and interpersonal skills

SCORING GUIDELINES (0-30 scale):
- 27-30: Excellent - Clear, authentic, well-structured with strong examples
- 24-26: Good - Solid answer with relevant examples, minor gaps
- 20-23: Acceptable - Covers the topic but lacks depth or clarity
- 16-19: Below Average - Vague, lacks specific examples or structure
- 0-15: Poor - Unclear, no relevant examples, doesn't address the question

Provide constructive feedback that helps the candidate improve their communication and self-presentation.`;
      } else {
        // Difficulty-aware technical evaluation
        let difficultyGuidance = '';
        if (difficulty === 'Easy') {
          difficultyGuidance = `EASY LEVEL EVALUATION:
- Expect basic understanding of concepts
- Accept simple explanations without deep optimization
- Focus on correctness and clarity
- Don't penalize for not mentioning advanced concepts
- Reward clear communication and understanding
- Be lenient with incomplete edge case handling

SCORING:
- 22-30: Excellent - Clear understanding, correct explanation
- 18-21: Good - Mostly correct with minor gaps
- 15-17: Acceptable - Basic understanding shown
- 10-14: Below Average - Some confusion or gaps
- 0-9: Poor - Incorrect or unclear`;
        } else if (difficulty === 'Medium') {
          difficultyGuidance = `MEDIUM LEVEL EVALUATION:
- Expect solid understanding and some depth
- Require consideration of trade-offs
- Expect handling of common edge cases
- Reward optimization thinking
- Penalize vague or incomplete explanations
- Expect real-world applicability

SCORING:
- 27-30: Excellent - Complete, well-structured, addresses all aspects
- 24-26: Good - Comprehensive with minor gaps
- 20-23: Acceptable - Covers main points but lacks depth
- 16-19: Below Average - Incomplete or missing critical components
- 0-15: Poor - Significantly incomplete or inaccurate`;
        } else if (difficulty === 'Hard') {
          difficultyGuidance = `HARD LEVEL EVALUATION:
- Expect deep technical understanding
- Require comprehensive system design thinking
- Expect handling of complex edge cases
- Require optimization and scalability discussion
- Penalize incomplete or shallow answers
- Expect architectural thinking

SCORING:
- 27-30: Exceptional - Complete, nuanced, addresses all aspects with depth
- 24-26: Strong - Comprehensive with minor gaps
- 20-23: Acceptable - Covers main points but lacks some depth
- 16-19: Below Average - Missing critical components
- 0-15: Poor - Significantly incomplete or inaccurate`;
        } else {
          difficultyGuidance = `EXPERT LEVEL EVALUATION:
- Expect mastery-level understanding
- Require cutting-edge thinking
- Expect handling of extreme edge cases
- Require strategic architectural decisions
- Penalize any significant gaps
- Expect novel problem-solving approaches

SCORING:
- 27-30: Exceptional - Mastery level, novel approaches, complete
- 24-26: Strong - Comprehensive with minor gaps
- 20-23: Acceptable - Good but missing some advanced thinking
- 16-19: Below Average - Missing advanced concepts
- 0-15: Poor - Incomplete or lacks expertise`;
        }

        evaluationPrompt = `You are an expert technical interviewer evaluating a candidate's technical response. Assess based on:
- Problem-solving approach and methodology
- Technical accuracy and depth
- Code quality and best practices
- Edge case handling and optimization
- Communication of technical concepts
- Real-world applicability

${difficultyGuidance}

Provide technical feedback that helps the candidate improve their problem-solving skills.`;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `${evaluationPrompt}

DIFFICULTY ADJUSTMENT (${difficulty}):
- Easy: Minimum ${thresholds.minScore}/30 to pass
- Medium: Minimum ${thresholds.minScore}/30 to pass
- Hard: Minimum ${thresholds.minScore}/30 to pass
- Expert: Minimum ${thresholds.minScore}/30 to pass

Return a JSON object strictly matching this schema:
{
  "score": <number 0-30>,
  "passesThreshold": <boolean>,
  "starAnalysis": {
    "situation": "string",
    "task": "string",
    "action": "string",
    "result": "string"
  } | null,
  "improvement": "actionable feedback for improvement",
  "criticalGaps": ["gap1", "gap2"],
  "strengths": ["strength1", "strength2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`
          },
          {
            role: 'user',
            content: `Interview Type: ${interviewType}
Difficulty: ${difficulty}
Question: ${question}
Candidate Answer: ${answerText}

Evaluate this response thoroughly and provide constructive feedback. Remember the difficulty level when scoring.`
          }
        ]
      });

      const evaluation = JSON.parse(response.choices[0].message.content);
      
      evaluation.difficultyLevel = difficulty;
      evaluation.minimumThreshold = thresholds.minScore;
      evaluation.optimalThreshold = thresholds.optimalScore;
      evaluation.interviewType = interviewType;
      
      return evaluation;
    } catch (error) {
      console.error("Evaluation error:", error);
      throw new Error("Failed to evaluate response");
    }
  }

  static async generateFollowUpQuestions(question, answerText, interviewType = 'Technical', difficulty = 'Medium', previousContext = null) {
    try {
      // Random probability: 40% chance to generate follow-up (more realistic)
      if (Math.random() > 0.4) {
        return null;
      }

      let followUpPrompt;
      
      if (interviewType === 'HR') {
        followUpPrompt = `Based on the candidate's answer, generate 1-2 follow-up questions that:
- Are DIRECTLY related to what they just said
- Probe deeper into their specific answer
- Ask for more details, results, or metrics from their story
- Probe deeper into their personal contribution (STAR method)
- Increase pressure slightly by asking "why" or "how"
- Are directly based on what they said
- Are NOT generic or repeated

Rules:
- No explanations
- No praise
- Only return the questions as a JSON array
- Questions must be specific to their answer
- Reference specific details they mentioned
- Build on their answer, don't change topic`;
      } else {
        followUpPrompt = `Based on the candidate's answer, generate 1-2 follow-up questions that:
- Are DIRECTLY related to what they just said
- Probe edge cases, error handling, or boundary conditions they didn't mention
- Ask about optimization or trade-offs they didn't discuss
- Identify logic gaps or incomplete explanations in their answer
- Increase difficulty slightly
- Are directly based on what they said
- Are NOT generic or repeated

Rules:
- No explanations
- No praise
- Only return the questions as a JSON array
- Questions must be specific to their answer
- Reference specific technical details they mentioned
- Build on their solution, don't change topic`;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `${followUpPrompt}

Return a JSON object strictly matching this schema:
{
  "followUpQuestions": [
    "Question 1",
    "Question 2"
  ]
}`
          },
          {
            role: 'user',
            content: `Interview Type: ${interviewType}
Difficulty: ${difficulty}
Original Question: ${question}
Candidate Answer: ${answerText}

${previousContext ? `Previous Context: ${previousContext}` : ''}

Generate follow-up questions that are DIRECTLY related to their answer. Reference specific things they said.`
          }
        ]
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      return parsed.followUpQuestions && parsed.followUpQuestions.length > 0 ? parsed.followUpQuestions : null;
    } catch (error) {
      console.error("Follow-up question generation error:", error);
      return null;
    }
  }

  static async transcribeAudio(filePath) {
    try {
      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
        language: 'en',
      });
      return response.text;
    } catch (error) {
      console.error("Transcription error:", error);
      throw new Error("Failed to transcribe audio");
    }
  }

  // Analyze answer for filler words and quality metrics
  static analyzeAnswerQuality(answerText) {
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'so', 'well', 'i mean', 'kind of', 'sort of', 'right', 'okay'];
    
    let fillerCount = 0;
    const lowerText = answerText.toLowerCase();
    
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) fillerCount += matches.length;
    });

    const answerLength = answerText.length;
    const wordCount = answerText.split(/\s+/).length;
    
    // Calculate communication score based on filler word ratio
    const fillerRatio = wordCount > 0 ? (fillerCount / wordCount) * 100 : 0;
    let communicationScore = 30;
    
    if (fillerRatio > 15) communicationScore -= 8;
    else if (fillerRatio > 10) communicationScore -= 5;
    else if (fillerRatio > 5) communicationScore -= 2;
    
    // Penalize very short answers
    if (wordCount < 20) communicationScore -= 5;
    
    return {
      fillerWords: fillerCount,
      answerLength,
      wordCount,
      fillerRatio: Math.round(fillerRatio * 10) / 10,
      communicationScore: Math.max(0, Math.min(30, communicationScore))
    };
  }

  // Generate performance analysis from all answers
  static generatePerformanceAnalysis(dialogue, difficulty, type) {
    const userAnswers = dialogue.filter(d => d.role === 'user' && d.feedback);
    
    if (userAnswers.length === 0) {
      return {
        weakAreas: [],
        strongAreas: [],
        recommendedPractice: [],
        averageAnswerLength: 0,
        averageTimePerQuestion: 0,
        totalFillerWords: 0,
        communicationScore: 0
      };
    }

    // Calculate averages
    const totalAnswerLength = userAnswers.reduce((sum, a) => sum + (a.answerLength || 0), 0);
    const totalTimeSpent = userAnswers.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    const totalFillerWords = userAnswers.reduce((sum, a) => sum + (a.fillerWords || 0), 0);
    const avgCommunicationScore = userAnswers.reduce((sum, a) => sum + (a.feedback.communicationScore || 0), 0) / userAnswers.length;

    // Identify weak and strong areas
    const scores = userAnswers.map(a => a.feedback.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const weakAreas = [];
    const strongAreas = [];

    userAnswers.forEach((answer, idx) => {
      if (answer.feedback.score < avgScore - 5) {
        if (answer.feedback.criticalGaps && answer.feedback.criticalGaps.length > 0) {
          weakAreas.push(...answer.feedback.criticalGaps);
        }
      }
      if (answer.feedback.score > avgScore + 5) {
        if (answer.feedback.strengths && answer.feedback.strengths.length > 0) {
          strongAreas.push(...answer.feedback.strengths);
        }
      }
    });

    // Generate recommendations
    const recommendedPractice = [];
    if (avgCommunicationScore < 20) {
      recommendedPractice.push('Practice reducing filler words and speaking more confidently');
    }
    if (totalAnswerLength / userAnswers.length < 500) {
      recommendedPractice.push('Provide more detailed and comprehensive answers');
    }
    if (avgScore < 20) {
      recommendedPractice.push(`Focus on ${difficulty} level concepts and problem-solving`);
    }
    if (type === 'Technical' && avgScore < 22) {
      recommendedPractice.push('Practice system design and edge case handling');
    }
    if (type === 'HR' && avgScore < 22) {
      recommendedPractice.push('Develop stronger storytelling with STAR method examples');
    }

    return {
      weakAreas: [...new Set(weakAreas)].slice(0, 5),
      strongAreas: [...new Set(strongAreas)].slice(0, 5),
      recommendedPractice,
      averageAnswerLength: Math.round(totalAnswerLength / userAnswers.length),
      averageTimePerQuestion: Math.round(totalTimeSpent / userAnswers.length),
      totalFillerWords,
      communicationScore: Math.round(avgCommunicationScore)
    };
  }
}

module.exports = AIService;
