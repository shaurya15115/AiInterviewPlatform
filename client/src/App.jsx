import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Dashboard from './components/Dashboard';
import InterviewEngine from './components/InterviewEngine';
import api from './utils/api';
import { Upload, Loader2, BookOpen, ChevronRight, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { token, setAuth, logout, theme, toggleTheme } = useStore();
  const [view, setView] = useState('dashboard');
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [setupState, setSetupState] = useState({ 
    file: null, 
    jd: '', 
    questionCount: 5, 
    difficulty: 'Medium', 
    type: 'Technical', 
    isUploading: false 
  });
  const [interviewState, setInterviewState] = useState(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, authForm);
      setAuth(res.data.user, res.data.token);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Authentication failed');
    }
  };

  const handleStartInterview = async () => {
    if (!setupState.file) return alert('Please upload a resume');
    setSetupState(prev => ({ ...prev, isUploading: true }));
    
    try {
      const formData = new FormData();
      formData.append('resume', setupState.file);
      await api.post('/interview/upload-resume', formData);

      const res = await api.post('/interview/start', { 
        jobDescription: setupState.jd || 'General technical interview',
        questionCount: setupState.questionCount,
        difficulty: setupState.difficulty,
        type: setupState.type
      });
      setInterviewState({ id: res.data.interviewId, questions: res.data.questions });
      setView('interview');
    } catch (err) {
      console.error('Start Interview Error:', err);
      alert(err.response?.data?.error || 'Failed to start interview');
    } finally {
      setSetupState(prev => ({ ...prev, isUploading: false }));
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
        <div className="absolute top-4 right-4 z-20">
          <button onClick={toggleTheme} className="p-2 rounded-full bg-surface border border-borderBase text-textMain hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--color-bg)_80%)] z-0 pointer-events-none" />

        <div className="glass p-10 max-w-md w-full relative z-10 border border-borderBase bg-surface/90 backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-center mb-2 text-textMain">AI Interview Pro</h1>
          <p className="text-textMuted text-center mb-8 text-sm">Ace your next big technical interview.</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={authForm.name}
                  onChange={e => setAuthForm({...authForm, name: e.target.value})}
                  className="w-full bg-surface border border-borderBase rounded-lg p-3 text-textMain focus:outline-none focus:border-primary"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Email</label>
              <input 
                type="email" 
                required 
                value={authForm.email}
                onChange={e => setAuthForm({...authForm, email: e.target.value})}
                className="w-full bg-surface border border-borderBase rounded-lg p-3 text-textMain focus:outline-none focus:border-primary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMuted mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={authForm.password}
                onChange={e => setAuthForm({...authForm, password: e.target.value})}
                className="w-full bg-surface border border-borderBase rounded-lg p-3 text-textMain focus:outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm mt-6"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)} 
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <nav className="border-b border-slate-800 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl cursor-pointer" onClick={() => setView('dashboard')}>
            <BookOpen className="w-6 h-6" />
            AI Interview Pro
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-surface/50 border border-borderBase text-textMain hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={logout} className="text-sm text-textMuted hover:text-textMain transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-8">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard startNewInterview={() => setView('setup')} />
            </motion.div>
          )}

          {view === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto p-6">
              <div className="glass p-8">
                <h2 className="text-2xl font-bold mb-6">Setup Interview</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">Upload Resume (PDF)</label>
                    <label className="flex items-center justify-center w-full h-32 px-4 transition bg-surface border-2 border-borderBase border-dashed rounded-xl hover:border-primary hover:bg-surface cursor-pointer">
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-textMuted" />
                        <span className="font-medium text-textMuted">
                          {setupState.file ? setupState.file.name : 'Drop PDF here or click to browse'}
                        </span>
                      </div>
                      <input type="file" className="hidden" accept=".pdf" onChange={(e) => setSetupState(prev => ({ ...prev, file: e.target.files[0] }))} />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textMain mb-2">Target Job Description (Optional)</label>
                    <textarea 
                      value={setupState.jd}
                      onChange={(e) => setSetupState(prev => ({ ...prev, jd: e.target.value }))}
                      className="w-full bg-surface border border-borderBase rounded-xl p-4 text-textMain focus:outline-none focus:border-primary h-32 resize-none"
                      placeholder="Paste JD here to generate highly targeted questions..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">Number of Questions</label>
                      <select 
                        value={setupState.questionCount}
                        onChange={(e) => setSetupState(prev => ({ ...prev, questionCount: Number(e.target.value) }))}
                        className="w-full bg-surface border border-borderBase rounded-xl p-3 text-textMain focus:outline-none focus:border-primary appearance-none"
                      >
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                        <option value={20}>20 Questions</option>
                        <option value={50}>50 Questions</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">Difficulty</label>
                      <select 
                        value={setupState.difficulty}
                        onChange={(e) => setSetupState(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full bg-surface border border-borderBase rounded-xl p-3 text-textMain focus:outline-none focus:border-primary appearance-none"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-textMain mb-2">Interview Type</label>
                      <select 
                        value={setupState.type}
                        onChange={(e) => setSetupState(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-surface border border-borderBase rounded-xl p-3 text-textMain focus:outline-none focus:border-primary appearance-none"
                      >
                        <option value="Technical">Technical</option>
                        <option value="HR">HR / Behavioral</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleStartInterview}
                    disabled={setupState.isUploading || !setupState.file}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {setupState.isUploading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Preparing AI Engine...</>
                    ) : (
                      'Initialize Interview'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'interview' && interviewState && (
            <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <InterviewEngine 
                interviewId={interviewState.id} 
                initialQuestions={interviewState.questions}
                interviewType={setupState.type}
                onComplete={() => setView('dashboard')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
