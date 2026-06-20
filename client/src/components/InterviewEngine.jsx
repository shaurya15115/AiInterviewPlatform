import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, ChevronRight, Activity, Bot, Clock, Terminal, Keyboard, Send, Signal, CheckCircle2, Lock } from 'lucide-react';
import { useVoiceProcessor } from '../hooks/useVoiceProcessor';
import VoiceVisualizer from './VoiceVisualizer';
import ResultsPage from './ResultsPage';
import api from '../utils/api';

const InterviewEngine = ({ interviewId, initialQuestions, onComplete, interviewType = 'Technical' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [textAnswersCount, setTextAnswersCount] = useState(0);
  const [isTextInputMode, setIsTextInputMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [questions] = useState(initialQuestions || []);
  const [feedback, setFeedback] = useState(null);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [interviewData, setInterviewData] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const maxTextAllowed = Math.floor(questions.length * 0.6);
  const remainingTextAllowed = maxTextAllowed - textAnswersCount;

  const { isRecording, startRecording, stopRecording, audioBlob, volume } = useVoiceProcessor();

  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (audioBlob && !isProcessing) {
      submitAnswer(audioBlob);
    }
  }, [audioBlob]);

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    submitAnswer(null, textInput.trim());
    setTextAnswersCount(prev => prev + 1);
    setIsTextInputMode(false);
    setTextInput('');
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (questions[currentIndex] && !feedback) {
      speakText(questions[currentIndex].content);
    }
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [currentIndex, questions, feedback]);

  const submitAnswer = async (blob, textOverride = null) => {
    setIsProcessing(true);
    const formData = new FormData();
    if (blob) formData.append('audio', blob, 'answer.webm');
    if (textOverride) formData.append('answerText', textOverride);
    formData.append('questionIndex', currentIndex);
    
    // Calculate time spent on this question
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    formData.append('timeSpent', timeSpent);

    try {
      const res = await api.post(`/interview/${interviewId}/evaluate`, formData);
      
      // Show feedback immediately
      setFeedback({
        transcription: res.data.transcription,
        evaluation: res.data.evaluation
      });
      setFollowUpQuestions(res.data.followUpQuestions || []);

      if (res.data.status === 'Completed') {
        setInterviewData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    
    const formData = new FormData();
    formData.append('answerText', '[Candidate skipped this question]');
    formData.append('questionIndex', currentIndex);
    
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    formData.append('timeSpent', timeSpent);
    
    api.post(`/interview/${interviewId}/evaluate`, formData).then(res => {
      setFeedback({
        transcription: '[Skipped]',
        evaluation: res.data.evaluation
      });
      setFollowUpQuestions(res.data.followUpQuestions || []);

      if (res.data.status === 'Completed') {
        setInterviewData(res.data);
      }
    }).catch(console.error);
  };

  const nextQuestion = () => {
    setFeedback(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      api.get(`/interview/${interviewId}`).then(res => {
        setInterviewData(res.data);
        setShowResults(true);
      }).catch(console.error);
    }
  };

  const currentQ = questions[currentIndex];

  if (showResults && interviewData) {
    return (
      <ResultsPage 
        interview={interviewData}
        onRetake={() => onComplete()}
        onHome={() => onComplete()}
      />
    );
  }

  if (!currentQ) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-textMuted animate-spin mb-4" />
      <h2 className="text-2xl font-semibold text-textMain">Processing...</h2>
      <p className="text-textMuted mt-2 font-mono text-sm">Compiling your responses...</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 min-h-[85vh] flex flex-col font-sans">
      
      {/* Top Status Bar */}
      <div className="flex items-center justify-between bg-surface border border-borderBase rounded-lg p-3 mb-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full text-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-medium tracking-wider text-textMain uppercase">System Active</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs font-mono text-textMuted">ID: {interviewId?.substring(0, 8)}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-textMuted">
          <div className="flex items-center gap-1.5"><Signal className="w-3.5 h-3.5" /> Latency: 12ms</div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatTime(elapsedTime)}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full">
        
        {/* Left Sidebar - Question Map */}
        <div className="w-full lg:w-72 bg-surface border border-borderBase rounded-xl p-4 flex flex-col">
          <div className="mb-4 pb-4 border-b border-borderBase">
            <h3 className="text-sm font-semibold text-textMain uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-textMuted" />
              Session Map
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {questions.map((_, idx) => {
              const isActive = idx === currentIndex;
              const isPast = idx < currentIndex;
              return (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border text-sm flex items-center gap-3 transition-colors ${
                    isActive ? 'bg-white/5 border-borderBase' : 
                    isPast ? 'bg-transparent border-transparent' : 'bg-transparent border-transparent opacity-40'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isPast ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                     isActive ? <div className="w-4 h-4 rounded-full border-2 border-borderBase flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /></div> :
                     <Lock className="w-4 h-4 text-textMuted" />}
                  </div>
                  <span className={`font-medium ${isActive ? 'text-textMain' : 'text-textMuted'}`}>
                    Question {idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-borderBase">
            <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-500" 
                style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-textMuted mt-2 font-mono">{Math.round(((currentIndex) / questions.length) * 100)}% Complete</p>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {feedback ? (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar"
              >
                {/* Feedback Section */}
                <div className="bg-surface border border-borderBase rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-textMain flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Answer Recorded
                    </h3>
                    <span className="text-3xl font-bold text-primary">{feedback.evaluation?.score || 0}<span className="text-sm text-textMuted">/30</span></span>
                  </div>

                  <div className="bg-black/5 dark:bg-white/[0.02] border border-borderBase p-4 rounded-lg">
                    <p className="text-xs text-textMuted uppercase tracking-wider mb-2 font-mono">Your Answer</p>
                    <p className="text-textMain italic">{feedback.transcription}</p>
                  </div>

                  {feedback.evaluation && (
                    <div className="space-y-3">
                      {feedback.evaluation.passesThreshold !== undefined && (
                        <div className={`${feedback.evaluation.passesThreshold ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} border p-3 rounded-lg`}>
                          <p className="text-xs uppercase tracking-wider font-mono mb-1" style={{color: feedback.evaluation.passesThreshold ? '#10b981' : '#ef4444'}}>Status</p>
                          <p className="font-semibold" style={{color: feedback.evaluation.passesThreshold ? '#10b981' : '#ef4444'}}>{feedback.evaluation.passesThreshold ? 'Passed' : 'Below Threshold'}</p>
                        </div>
                      )}

                      {feedback.evaluation.improvement && (
                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                          <p className="text-xs text-blue-600 uppercase tracking-wider font-mono mb-2">Feedback</p>
                          <p className="text-sm text-textMain">{feedback.evaluation.improvement}</p>
                        </div>
                      )}

                      {feedback.evaluation.strengths && feedback.evaluation.strengths.length > 0 && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                          <p className="text-xs text-emerald-600 uppercase tracking-wider font-mono mb-2">Strengths</p>
                          <ul className="text-sm text-textMain space-y-1">
                            {feedback.evaluation.strengths.map((s, i) => <li key={i}>✓ {s}</li>)}
                          </ul>
                        </div>
                      )}

                      {feedback.evaluation.suggestions && feedback.evaluation.suggestions.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                          <p className="text-xs text-amber-600 uppercase tracking-wider font-mono mb-2">Suggestions</p>
                          <ul className="text-sm text-textMain space-y-1">
                            {feedback.evaluation.suggestions.map((s, i) => <li key={i}>→ {s}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Follow-up Questions */}
                {followUpQuestions && followUpQuestions.length > 0 && (
                  <div className="bg-surface border border-borderBase rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-textMain flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Follow-up Questions
                    </p>
                    {followUpQuestions.map((q, idx) => (
                      <div key={idx} className="bg-black/5 dark:bg-white/[0.02] border border-borderBase p-3 rounded-lg">
                        <p className="text-sm text-textMain">{q}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Next Button */}
                <button
                  onClick={nextQuestion}
                  className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Interview'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="question"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col gap-4"
              >
                
                {/* AI Evaluator Output */}
                <div className="flex-1 bg-surface border border-borderBase rounded-xl flex flex-col overflow-hidden relative">
                  <div className="bg-black/5 dark:bg-white/[0.02] border-b border-borderBase px-4 py-2.5 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-textMuted" />
                    <span className="text-xs font-mono text-textMuted uppercase tracking-wider">AI Interrogator Output</span>
                    {isAiSpeaking && <span className="ml-auto text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 uppercase">Transmitting Audio...</span>}
                  </div>
                  <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
                    <div className="max-w-3xl">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${isAiSpeaking ? 'bg-white text-black border-white' : 'bg-surface text-textMuted border-borderBase'}`}>
                          <Bot className="w-5 h-5" />
                        </div>
                        <p className="text-xl md:text-2xl text-textMain leading-relaxed font-medium">
                          {currentQ?.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Input Dashboard */}
                <div className="h-56 bg-surface border border-borderBase rounded-xl p-6 flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.02] to-transparent pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-auto relative z-10">
                    <span className="text-xs font-mono text-textMuted uppercase tracking-wider">Candidate Input Interface</span>
                    <span className="text-xs font-mono text-textMuted">{isRecording ? 'Status: REC' : isProcessing ? 'Status: EVAL' : 'Status: IDLE'}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center flex-1 relative z-10 w-full">
                    <div className="h-20 mb-4 flex items-center justify-center w-full">
                      {isRecording ? (
                         <div className="w-full max-w-md"><VoiceVisualizer volume={volume} isRecording={isRecording} /></div>
                      ) : isProcessing ? (
                         <div className="flex items-center gap-3 text-textMain">
                           <Loader2 className="w-5 h-5 animate-spin text-textMuted" />
                           <span className="text-sm font-mono tracking-widest uppercase">Processing Answer...</span>
                         </div>
                      ) : isTextInputMode ? (
                         <textarea
                           value={textInput}
                           onChange={(e) => setTextInput(e.target.value)}
                           className="w-full h-full bg-surface border border-borderBase rounded-lg p-3 text-sm text-textMain focus:outline-none focus:border-primary resize-none custom-scrollbar"
                           placeholder="Type your answer here..."
                           autoFocus
                         />
                      ) : (
                         <p className="text-sm font-mono text-textMuted uppercase tracking-widest">Awaiting Audio Input</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      {isTextInputMode ? (
                        <>
                          <button onClick={handleTextSubmit} disabled={!textInput.trim()} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm hover:bg-emerald-700 disabled:opacity-50">
                            <Send className="w-4 h-4" /> Submit Text
                          </button>
                          <button onClick={() => setIsTextInputMode(false)} className="text-sm font-medium text-textMuted hover:text-textMain px-4 py-2.5 rounded-lg border border-borderBase hover:bg-white/5 transition-colors">
                            Cancel
                          </button>
                        </>
                      ) : isRecording ? (
                        <button onClick={stopRecording} className="flex items-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm hover:bg-red-600">
                          <Square className="w-4 h-4" /> Stop Recording
                        </button>
                      ) : (
                        <>
                          <button onClick={startRecording} disabled={isProcessing} className="flex items-center gap-2 bg-white hover:bg-slate-200 disabled:bg-surface disabled:text-textMuted text-black px-6 py-2.5 rounded-lg font-medium transition-colors text-sm">
                            <Mic className="w-4 h-4" /> Initialize Microphone
                          </button>
                          {!isProcessing && (
                            <button 
                              onClick={() => setIsTextInputMode(true)} 
                              disabled={remainingTextAllowed <= 0}
                              title={remainingTextAllowed <= 0 ? "You have reached the maximum allowed text answers (60%). Please use voice." : `You can answer ${remainingTextAllowed} more questions using text.`}
                              className="flex items-center gap-2 bg-surface hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-surface text-textMain px-6 py-2.5 rounded-lg font-medium transition-colors text-sm border border-borderBase"
                            >
                              <Keyboard className="w-4 h-4" /> Type Answer
                            </button>
                          )}
                        </>
                      )}
                      
                      {!isRecording && !isProcessing && !isTextInputMode && (
                        <button onClick={handleSkip} className="text-sm font-medium text-textMuted hover:text-textMain px-4 py-2.5 rounded-lg border border-borderBase hover:bg-white/5 transition-colors">
                          Skip
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InterviewEngine;
