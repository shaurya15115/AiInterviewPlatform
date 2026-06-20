import { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Play, Trash2, HelpCircle } from 'lucide-react';
import api from '../utils/api';

const Dashboard = ({ startNewInterview }) => {
  const [interviews, setInterviews] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interview');
      setInterviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInterviews();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this interview record?')) return;
    try {
      await api.delete(`/interview/${id}`);
      setInterviews(prev => prev.filter(i => i._id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete interview');
    }
  };

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

  if (loading) return <div className="text-center p-20">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-textMain">
            AI Interview Dashboard
          </h1>
          <p className="text-textMuted mt-1">Track your progress and analyze your performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="bg-surface text-textMain px-5 py-2.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 font-medium text-sm border border-borderBase"
          >
            <HelpCircle className="w-5 h-5" />
            How Metrics Work
          </button>
          <button
            onClick={startNewInterview}
            className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium text-sm"
          >
            <Play className="w-5 h-5" />
            Start New Interview
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass p-8 rounded-xl border border-borderBase space-y-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-textMain mb-2">Understanding Your Performance Metrics</h2>
                <p className="text-textMuted">Each metric is rated out of 30 points. Here's what each one means and what you should aim for.</p>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-textMuted hover:text-textMain text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Technical Depth (0-30)</h3>
                <p className="text-sm text-textMain mb-2">Direct reflection of your answer quality and comprehensiveness.</p>
                <p className="text-xs text-textMuted"><strong>Aim for:</strong> 24-30</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-600 mb-2">Clarity (0-30)</h3>
                <p className="text-sm text-textMain mb-2">How clearly you communicated your answer. +2 if passes threshold, -3 if below.</p>
                <p className="text-xs text-textMuted"><strong>Aim for:</strong> 24-30</p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
                <h3 className="font-semibold text-emerald-600 mb-2">Confidence (0-30)</h3>
                <p className="text-sm text-textMain mb-2">How confident you appeared. +1 if excellent, -2 if weak.</p>
                <p className="text-xs text-textMuted"><strong>Aim for:</strong> 24-30</p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-600 mb-2">Experience Match (0-30)</h3>
                <p className="text-sm text-textMain mb-2">How well your answer aligns with job requirements. Always +3 bonus.</p>
                <p className="text-xs text-textMuted"><strong>Aim for:</strong> 24-30</p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-600 mb-2">Soft Skills (0-30)</h3>
                <p className="text-sm text-textMain mb-2">Communication, teamwork, and problem-solving approach. Always +2 bonus.</p>
                <p className="text-xs text-textMuted"><strong>Aim for:</strong> 24-30</p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-600 mb-2">Performance Targets</h3>
                <ul className="text-sm text-textMain space-y-1">
                  <li>✓ <strong>27-30:</strong> Excellent</li>
                  <li>✓ <strong>24-26:</strong> Good</li>
                  <li>✓ <strong>20-23:</strong> Acceptable</li>
                  <li>✓ <strong>16-19:</strong> Below Average</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-2">Reading Your Radar Chart</h4>
              <ul className="text-sm text-textMain space-y-2">
                <li>• <strong>Larger polygon</strong> = Better overall performance</li>
                <li>• <strong>Balanced shape</strong> = Consistent across all areas</li>
                <li>• <strong>Numbers on chart</strong> = Exact score for each metric (out of 30)</li>
                <li>• <strong>Perfect score</strong> = All 5 metrics at 30 points</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass p-6 h-[500px] flex flex-col">
          <h3 className="text-lg font-medium mb-2 border-b border-borderBase pb-3 text-textMain">Latest Performance</h3>
          <p className="text-xs text-textMuted mb-4">All metrics are rated out of 30 points</p>
          {interviews.length > 0 && interviews[0].metrics ? (
            <>
              <div className="flex-1 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={getRadarData(interviews[0].metrics)}>
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
              <div className="mt-4 pt-4 border-t border-borderBase">
                <p className="text-xs text-textMuted text-center font-mono">
                  Each metric: 0-30 points | Higher is better
                </p>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-textMuted">No data available</div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-medium mb-4 border-b border-borderBase pb-3 text-textMain">Past Attempts</h3>
          <AnimatePresence>
            {interviews.map((interview, idx) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass overflow-hidden"
              >
                <div 
                  className="p-5 flex justify-between items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(expandedId === interview._id ? null : interview._id)}
                >
                  <div>
                    <h4 className="font-medium text-textMain">{interview.jobDescription || 'General Mock Interview'}</h4>
                    <p className="text-sm text-textMuted">
                      {new Date(interview.createdAt).toLocaleDateString()} • {interview.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{interview.totalScore}<span className="text-sm text-primary/70">/{interview.questionCount * 30}</span></p>
                      <p className="text-xs text-textMuted uppercase tracking-widest">Total Score</p>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, interview._id)}
                      className="p-2 text-textMuted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <ChevronDown className={`w-5 h-5 text-textMuted transition-transform ${expandedId === interview._id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedId === interview._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-borderBase bg-black/5 dark:bg-black/20"
                    >
                      <div className="p-5 space-y-4">
                        {interview.dialogue.filter(d => d.role === 'ai').map((q, i) => {
                          const answer = interview.dialogue.filter(ans => ans.role === 'user')[i];
                          return (
                          <div key={i} className="bg-surface/40 p-4 rounded-xl border border-borderBase hover:border-borderBase/80 transition-colors">
                            <p className="font-medium text-textMain mb-2">Q: {q.content}</p>
                            {answer ? (
                              <>
                                <p className="text-textMuted italic mb-4">A: "{answer.content}"</p>
                                {answer.feedback && (
                                  <div className="flex flex-col gap-4 mt-4 bg-primary/5 p-4 rounded-lg border border-primary/20 text-sm">
                                    <div className="flex gap-4 items-start">
                                      <div className="flex flex-col items-center justify-center bg-primary/10 w-12 h-12 rounded-lg border border-primary/20 flex-shrink-0">
                                        <span className="font-bold text-lg text-primary">{answer.feedback.score}<span className="text-xs text-primary/70">/30</span></span>
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="text-xs font-mono text-primary uppercase tracking-wider mb-1">Feedback</h5>
                                        <p className="text-textMain leading-relaxed">{answer.feedback.improvement}</p>
                                      </div>
                                    </div>
                                    
                                    {answer.feedback.strengths && answer.feedback.strengths.length > 0 && (
                                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                                        <h5 className="text-xs font-mono text-emerald-600 uppercase tracking-wider mb-2">Strengths</h5>
                                        <ul className="text-xs text-textMain space-y-1">
                                          {answer.feedback.strengths.map((s, idx) => <li key={idx}>✓ {s}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {answer.feedback.suggestions && answer.feedback.suggestions.length > 0 && (
                                      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                                        <h5 className="text-xs font-mono text-amber-600 uppercase tracking-wider mb-2">Suggestions</h5>
                                        <ul className="text-xs text-textMain space-y-1">
                                          {answer.feedback.suggestions.map((s, idx) => <li key={idx}>→ {s}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {answer.feedback.starAnalysis && Object.keys(answer.feedback.starAnalysis).length > 0 && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 border-t border-primary/10 pt-4">
                                        {['situation', 'task', 'action', 'result'].map(key => answer.feedback.starAnalysis[key] && (
                                          <div key={key} className="bg-black/5 dark:bg-white/[0.02] border border-borderBase p-3 rounded-lg">
                                            <h4 className="text-textMain text-xs font-mono uppercase tracking-wider mb-1">{key.charAt(0)} - {key}</h4>
                                            <p className="text-xs text-textMuted leading-relaxed">{answer.feedback.starAnalysis[key]}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-textMuted italic mb-4">A: <span className="opacity-60">Not attempted</span></p>
                            )}
                          </div>
                        )})}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
          {interviews.length === 0 && (
            <div className="text-center p-10 glass text-textMuted">
              No previous interviews found. Upload a resume and start your first session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
