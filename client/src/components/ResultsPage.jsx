import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, RotateCcw, Home, ChevronDown, TrendingUp, AlertCircle, 
  CheckCircle2, Zap, MessageSquare, Target, Award
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const ResultsPage = ({ interview, onRetake, onHome }) => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const getRadarData = (metrics) => {
    if (!metrics) return [];
    return [
      { subject: 'Tech Depth', A: metrics.technicalDepth, fullMark: 30 },
      { subject: 'Clarity', A: metrics.clarity, fullMark: 30 },
      { subject: 'Confidence', A: metrics.confidence, fullMark: 30 },
      { subject: 'Exp Match', A: metrics.experienceMatch, fullMark: 30 },
      { subject: 'Soft Skills', A: metrics.softSkills, fullMark: 30 },
    ];
  };

  const getAssessmentColor = (passRate) => {
    if (passRate === 100) return 'from-emerald-500 to-green-600';
    if (passRate >= 80) return 'from-blue-500 to-cyan-600';
    if (passRate >= 60) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getAssessmentBg = (passRate) => {
    if (passRate === 100) return 'bg-emerald-500/10 border-emerald-500/20';
    if (passRate >= 80) return 'bg-blue-500/10 border-blue-500/20';
    if (passRate >= 60) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getAssessmentTextColor = (passRate) => {
    if (passRate === 100) return 'text-emerald-600';
    if (passRate >= 80) return 'text-blue-600';
    if (passRate >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const userAnswers = interview.dialogue.filter(d => d.role === 'user');
  const questions = interview.dialogue.filter(d => d.role === 'ai');

  const exportPDF = () => {
    const content = `
INTERVIEW RESULTS REPORT
========================

Overall Assessment: ${interview.overallAssessment}
Pass Rate: ${interview.thresholdPassRate.toFixed(1)}%
Total Score: ${interview.totalScore}/${interview.questionCount * 30}
Average Score: ${interview.averageScore}/30

Interview Details:
- Type: ${interview.type}
- Difficulty: ${interview.difficulty}
- Questions: ${interview.questionCount}
- Date: ${new Date(interview.createdAt).toLocaleDateString()}

Performance Metrics:
- Technical Depth: ${interview.metrics.technicalDepth}/30
- Clarity: ${interview.metrics.clarity}/30
- Confidence: ${interview.metrics.confidence}/30
- Experience Match: ${interview.metrics.experienceMatch}/30
- Soft Skills: ${interview.metrics.softSkills}/30

${interview.performanceAnalysis ? `
Performance Analysis:
- Communication Score: ${interview.performanceAnalysis.communicationScore}/30
- Average Answer Length: ${interview.performanceAnalysis.averageAnswerLength} characters
- Average Time per Question: ${interview.performanceAnalysis.averageTimePerQuestion} seconds
- Total Filler Words: ${interview.performanceAnalysis.totalFillerWords}

Weak Areas:
${interview.performanceAnalysis.weakAreas.map(a => `- ${a}`).join('\n')}

Strong Areas:
${interview.performanceAnalysis.strongAreas.map(a => `- ${a}`).join('\n')}

Recommended Practice:
${interview.performanceAnalysis.recommendedPractice.map(p => `- ${p}`).join('\n')}
` : ''}

Individual Question Results:
${userAnswers.map((answer, idx) => `
Q${idx + 1}: ${questions[idx]?.content}
Score: ${answer.feedback.score}/30
Status: ${answer.feedback.passesThreshold ? 'PASSED' : 'BELOW THRESHOLD'}
Answer: ${answer.content}
Feedback: ${answer.feedback.improvement}
`).join('\n')}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `interview-results-${interview._id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-textMain mb-2">Interview Complete</h1>
            <p className="text-textMuted">Here's your comprehensive performance analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 bg-surface border border-borderBase text-textMain px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button
              onClick={onHome}
              className="flex items-center gap-2 bg-surface border border-borderBase text-textMain px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>

        {/* Overall Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass border border-borderBase rounded-2xl p-8 bg-gradient-to-br ${getAssessmentColor(interview.thresholdPassRate)}/5`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Assessment */}
            <div className={`${getAssessmentBg(interview.thresholdPassRate)} border rounded-xl p-6`}>
              <div className="flex items-center gap-3 mb-4">
                {interview.thresholdPassRate === 100 ? <Award className="w-6 h-6 text-emerald-600" /> :
                 interview.thresholdPassRate >= 80 ? <CheckCircle2 className="w-6 h-6 text-blue-600" /> :
                 interview.thresholdPassRate >= 60 ? <AlertCircle className="w-6 h-6 text-amber-600" /> :
                 <AlertCircle className="w-6 h-6 text-red-600" />}
                <h3 className="font-semibold text-textMain">Overall Assessment</h3>
              </div>
              <p className={`text-sm font-medium ${getAssessmentTextColor(interview.thresholdPassRate)}`}>
                {interview.overallAssessment}
              </p>
            </div>

            {/* Pass Rate */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-textMain">Pass Rate</h3>
              </div>
              <p className="text-3xl font-bold text-primary">{interview.thresholdPassRate.toFixed(1)}%</p>
              <p className="text-xs text-textMuted mt-2">{Math.round(interview.thresholdPassRate / 100 * interview.questionCount)} of {interview.questionCount} passed</p>
            </div>

            {/* Total Score */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-textMain">Total Score</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">{interview.totalScore}</p>
              <p className="text-xs text-textMuted mt-2">out of {interview.questionCount * 30}</p>
            </div>

            {/* Average Score */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-emerald-600" />
                <h3 className="font-semibold text-textMain">Average Score</h3>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{interview.averageScore}</p>
              <p className="text-xs text-textMuted mt-2">per question</p>
            </div>
          </div>
        </motion.div>

        {/* Metrics & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass border border-borderBase rounded-2xl p-6 lg:col-span-1"
          >
            <h3 className="text-lg font-semibold text-textMain mb-4">Performance Metrics</h3>
            <p className="text-xs text-textMuted mb-4">All metrics rated out of 30</p>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={getRadarData(interview.metrics)}>
                  <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 30]} 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickFormatter={(value) => value === 0 ? '0' : value === 30 ? '30' : ''}
                  />
                  <Radar 
                    name="Score" 
                    dataKey="A" 
                    stroke="#4f46e5" 
                    fill="#4f46e5" 
                    fillOpacity={0.2}
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={true}
                    label={({ value, angle, radius }) => {
                      const RADIAN = Math.PI / 180;
                      const x = radius * Math.cos((angle - 90) * RADIAN);
                      const y = radius * Math.sin((angle - 90) * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#e2e8f0"
                          textAnchor={x > 0 ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize="14"
                          fontWeight="700"
                          className="drop-shadow-lg"
                          style={{
                            textShadow: '0 2px 6px rgba(0,0,0,0.6)',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {value}
                        </text>
                      );
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Performance Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass border border-borderBase rounded-2xl p-6 lg:col-span-2 space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-textMain mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Communication Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface/50 border border-borderBase rounded-lg p-4">
                  <p className="text-xs text-textMuted uppercase tracking-wider mb-2">Communication Score</p>
                  <p className="text-2xl font-bold text-primary">{interview.performanceAnalysis?.communicationScore || 0}<span className="text-sm text-textMuted">/30</span></p>
                </div>
                <div className="bg-surface/50 border border-borderBase rounded-lg p-4">
                  <p className="text-xs text-textMuted uppercase tracking-wider mb-2">Filler Words</p>
                  <p className="text-2xl font-bold text-amber-600">{interview.performanceAnalysis?.totalFillerWords || 0}</p>
                </div>
                <div className="bg-surface/50 border border-borderBase rounded-lg p-4">
                  <p className="text-xs text-textMuted uppercase tracking-wider mb-2">Avg Answer Length</p>
                  <p className="text-2xl font-bold text-blue-600">{interview.performanceAnalysis?.averageAnswerLength || 0}<span className="text-sm text-textMuted"> chars</span></p>
                </div>
                <div className="bg-surface/50 border border-borderBase rounded-lg p-4">
                  <p className="text-xs text-textMuted uppercase tracking-wider mb-2">Avg Time/Question</p>
                  <p className="text-2xl font-bold text-emerald-600">{interview.performanceAnalysis?.averageTimePerQuestion || 0}<span className="text-sm text-textMuted">s</span></p>
                </div>
              </div>
            </div>

            {/* Weak Areas */}
            {interview.performanceAnalysis?.weakAreas && interview.performanceAnalysis.weakAreas.length > 0 && (
              <div>
                <h4 className="font-semibold text-textMain mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Areas to Improve
                </h4>
                <div className="space-y-2">
                  {interview.performanceAnalysis.weakAreas.map((area, idx) => (
                    <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-sm text-textMain">→ {area}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strong Areas */}
            {interview.performanceAnalysis?.strongAreas && interview.performanceAnalysis.strongAreas.length > 0 && (
              <div>
                <h4 className="font-semibold text-textMain mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Your Strengths
                </h4>
                <div className="space-y-2">
                  {interview.performanceAnalysis.strongAreas.map((area, idx) => (
                    <div key={idx} className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                      <p className="text-sm text-textMain">✓ {area}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {interview.performanceAnalysis?.recommendedPractice && interview.performanceAnalysis.recommendedPractice.length > 0 && (
              <div>
                <h4 className="font-semibold text-textMain mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Recommended Practice
                </h4>
                <div className="space-y-2">
                  {interview.performanceAnalysis.recommendedPractice.map((rec, idx) => (
                    <div key={idx} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-sm text-textMain">→ {rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Individual Question Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-2xl font-semibold text-textMain">Question-by-Question Breakdown</h3>

          <AnimatePresence>
            {userAnswers.map((answer, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass border border-borderBase rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                      answer.feedback.passesThreshold ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border border-red-500/40 text-red-400'
                    }`}>
                      Q{idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-textMain mb-1">{questions[idx]?.content}</p>
                      <div className="flex items-center gap-4 text-sm text-textMuted">
                        <span className="flex items-center gap-1">
                          <span className="font-bold text-lg text-primary">{answer.feedback.score}</span>
                          <span>/30</span>
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          answer.feedback.passesThreshold ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {answer.feedback.passesThreshold ? 'PASSED' : 'BELOW THRESHOLD'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-textMuted transition-transform ${expandedQuestion === idx ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {expandedQuestion === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-borderBase bg-black/5 dark:bg-white/[0.02]"
                    >
                      <div className="p-6 space-y-6">
                        {/* Your Answer */}
                        <div>
                          <h4 className="font-semibold text-textMain mb-3">Your Answer</h4>
                          <div className="bg-surface/50 border border-borderBase rounded-lg p-4">
                            <p className="text-sm text-textMain italic">{answer.content}</p>
                          </div>
                        </div>

                        {/* Feedback */}
                        <div>
                          <h4 className="font-semibold text-textMain mb-3">Feedback</h4>
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-sm text-textMain">{answer.feedback.improvement}</p>
                          </div>
                        </div>

                        {/* Strengths */}
                        {answer.feedback.strengths && answer.feedback.strengths.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-textMain mb-3 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              Strengths
                            </h4>
                            <div className="space-y-2">
                              {answer.feedback.strengths.map((s, i) => (
                                <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                  <p className="text-sm text-textMain">✓ {s}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggestions */}
                        {answer.feedback.suggestions && answer.feedback.suggestions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-textMain mb-3 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              Suggestions
                            </h4>
                            <div className="space-y-2">
                              {answer.feedback.suggestions.map((s, i) => (
                                <div key={i} className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                  <p className="text-sm text-textMain">→ {s}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {answer.feedback.followUpQuestions && answer.feedback.followUpQuestions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-textMain mb-3">Follow-up Questions Asked</h4>
                            <div className="space-y-2">
                              {answer.feedback.followUpQuestions.map((q, i) => (
                                <div key={i} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                  <p className="text-sm text-textMain">→ {q}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Answer Metrics */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-surface/50 border border-borderBase rounded-lg p-3">
                            <p className="text-xs text-textMuted uppercase tracking-wider mb-1">Time Spent</p>
                            <p className="text-lg font-bold text-textMain">{answer.timeSpent}s</p>
                          </div>
                          <div className="bg-surface/50 border border-borderBase rounded-lg p-3">
                            <p className="text-xs text-textMuted uppercase tracking-wider mb-1">Answer Length</p>
                            <p className="text-lg font-bold text-textMain">{answer.answerLength}</p>
                          </div>
                          <div className="bg-surface/50 border border-borderBase rounded-lg p-3">
                            <p className="text-xs text-textMuted uppercase tracking-wider mb-1">Filler Words</p>
                            <p className="text-lg font-bold text-textMain">{answer.fillerWords}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4 justify-center pt-8"
        >
          <button
            onClick={onRetake}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Interview
          </button>
          <button
            onClick={onHome}
            className="flex items-center gap-2 bg-surface border border-borderBase text-textMain hover:bg-white/5 px-8 py-3 rounded-lg font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage;
