import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Play, Send, CheckCircle,
  XCircle, Moon, Sun, Zap,
  FileText, Activity, MessageSquare, ChevronDown,
  BookOpen, CircleDollarSign, Trophy, Wand2, Copy, Check,
  List, ChevronLeft, ChevronRight, Clock, Settings, Menu,
  Pause, RotateCcw, LogIn, ShieldAlert, LogOut, User,
  Search // Import Search Icon
} from 'lucide-react';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import SolutionLock from '../components/SolutionLock';

// --- ASSETS: SOUNDS ---
const SUCCESS_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3";

// --- COMPONENT: CONFETTI EXPLOSION ---
const Confetti = () => {
  const particles = Array.from({ length: 50 }).map((_, i) => {
    const angle = Math.random() * 360;
    const velocity = Math.random() * 200 + 100;
    return {
      id: i,
      x: Math.cos(angle * (Math.PI / 180)) * velocity,
      y: Math.sin(angle * (Math.PI / 180)) * velocity,
      color: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
      scale: Math.random() * 0.5 + 0.5,
      rotation: Math.random() * 720,
      delay: Math.random() * 0.1
    };
  });

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[100]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: p.x,
            y: p.y + 100,
            opacity: 0,
            scale: p.scale,
            rotate: p.rotation
          }}
          transition={{ duration: 1.2, ease: "easeOut", delay: p.delay }}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
};

// --- HELPER: COPY BUTTON ---
const CopyButton = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 absolute top-3 right-3 z-10 border border-white/5"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

// --- HELPER: INTERACTIVE TIMER ---
const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  }

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-1 bg-zinc-800/50 p-1 pr-3 rounded-md border border-zinc-700/50 text-gray-300 font-mono text-xs tabular-nums">
      <button
        onClick={toggleTimer}
        className={`p-1 rounded hover:bg-zinc-700 transition-colors ${isRunning ? 'text-emerald-500' : 'text-gray-400'}`}
        title={isRunning ? "Pause" : "Start"}
      >
        {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
      </button>
      <span className="min-w-[40px] text-center">{formatTime(seconds)}</span>
      <button
        onClick={resetTimer}
        className="p-1 rounded hover:bg-zinc-700 text-gray-500 hover:text-white transition-colors ml-1"
        title="Reset"
      >
        <RotateCcw className="w-3 h-3" />
      </button>
    </div>
  );
};

const ProblemPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // --- STATE MANAGEMENT ---
  const [problem, setProblem] = useState(null);
  const [problemList, setProblemList] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  // Results
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);

  // UI State
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeBottomTab, setActiveBottomTab] = useState('testcase');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState(''); // New State for Sidebar Search
  const [showCelebration, setShowCelebration] = useState(false);

  // Solutions Tab State
  const [activeSolIndex, setActiveSolIndex] = useState(0);

  // Credit system: unlocked solution data
  const [unlockedSolution, setUnlockedSolution] = useState(null);
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);

  // Test Case Management
  const [activeTestCaseId, setActiveTestCaseId] = useState(0);
  const [cases, setCases] = useState([]);

  // --- GAMIFICATION STATE ---
  const [userScore, setUserScore] = useState(0);
  const [flyingCoins, setFlyingCoins] = useState([]);
  const scoreBadgeRef = useRef(null);
  const audioRef = useRef(new Audio(SUCCESS_SOUND_URL));

  const editorRef = useRef(null);
  let { problemId } = useParams();

  // --- 1. FETCH FULL PROBLEM LIST ---
  useEffect(() => {
    const fetchProblemList = async () => {
      try {
        // Fetch all problems (use high limit to get all for navigation)
        const response = await axiosClient.get('/problem/getAllProblem?limit=1000');
        // Handle new paginated response format { problems: [], pagination: {} }
        const problems = response.data.problems || response.data || [];
        setProblemList(problems);
      } catch (error) {
        console.error("Error fetching problem list", error);
      }
    };
    fetchProblemList();
  }, []);

  // --- 2. FETCH CURRENT PROBLEM & RESET ---
  useEffect(() => {
    setProblem(null);
    setLoading(true);
    setRunResult(null);
    setSubmitResult(null);
    setIsConsoleOpen(false);
    setActiveBottomTab('testcase');
    setActiveTestCaseId(0);
    setShowCelebration(false);

    const fetchProblem = async () => {
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(response.data);
        setCases(response.data.visibleTestCases || []);
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  // --- 3. NAVIGATION LOGIC ---
  const currentProblemIndex = problemList.findIndex(p => p._id === problemId);
  const prevProblemId = currentProblemIndex > 0 ? problemList[currentProblemIndex - 1]._id : null;
  const nextProblemId = currentProblemIndex < problemList.length - 1 ? problemList[currentProblemIndex + 1]._id : null;

  const navigateToProblem = (id) => {
    if (id) {
      navigate(`/problem/${id}`);
      setIsSidebarOpen(false);
    }
  };

  // --- 4. FETCH USER SCORE ---
  useEffect(() => {
    const fetchUserScore = async () => {
      try {
        if (user) {
          const checkRes = await axiosClient.get('/user/check');
          const userId = checkRes.data.user._id;
          if (userId) {
            const profileRes = await axiosClient.get(`/user/profile/${userId}`);
            setUserScore(profileRes.data.user.score || 0);
          }
        }
      } catch (error) {
        // Silent fail acceptable for score sync
      }
    };
    fetchUserScore();
  }, [user]);

  // --- 5. FORMATTER LOGIC ---
  const formatCode = (rawText) => {
    if (!rawText) return "";
    const tabSize = 2;
    let text = rawText
      .replace(/([^\s])\{/g, '$1 {')
      .replace(/\{/g, '{\n')
      .replace(/\}/g, '\n}\n')
      .replace(/;(?![^\(]*\))/g, ';\n');

    const lines = text.split('\n');
    let indentLevel = 0;

    const formattedLines = lines.map(line => {
      let trimmed = line.trim();
      if (!trimmed) return null;
      trimmed = trimmed.replace(/\b(if|for|while|switch|catch|function)\s*\(/g, '$1 (');
      trimmed = trimmed.replace(/,(\S)/g, ', $1');

      const codeOnly = trimmed.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').trim();
      if (codeOnly.match(/^[\}\]\)]/)) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      const indent = ' '.repeat(indentLevel * tabSize);
      const finalLine = indent + trimmed;
      if (codeOnly.match(/[\[\{\(]$/) || codeOnly.match(/^case\s.+:$/) || codeOnly.match(/^default:$/)) {
        indentLevel++;
      }
      return finalLine;
    }).filter(l => l !== null);

    return formattedLines.join('\n');
  };

  // --- 6. EDITOR CONFIG ---
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    const formatProvider = {
      provideDocumentFormattingEdits: (model) => {
        const formatted = formatCode(model.getValue());
        return [{
          range: model.getFullModelRange(),
          text: formatted,
        }];
      }
    };
    ['cpp', 'java', 'javascript'].forEach(lang => {
      monaco.languages.registerDocumentFormattingEditProvider(lang, formatProvider);
    });
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  // --- 7. CODE SYNC ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
  }, []);

  useEffect(() => {
    if (problem) {
      const dbLanguageMapping = { "cpp": "c++", "java": "java", "javascript": "javascript" };
      const targetLang = dbLanguageMapping[selectedLanguage];
      const storageKey = `draft_${problemId}_${selectedLanguage}`;
      const savedCode = localStorage.getItem(storageKey);

      if (savedCode) {
        setCode(savedCode);
      } else {
        const startCodeObj = problem.startCode.find(sc =>
          sc.language.toLowerCase() === targetLang.toLowerCase()
        );
        const rawCode = startCodeObj ? startCodeObj.initialCode : "";
        const prettyCode = formatCode(rawCode);
        setCode(prettyCode);
      }
    }
  }, [selectedLanguage, problem, problemId]);

  // --- HANDLERS ---
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleEditorChange = (value) => {
    const newCode = value || '';
    setCode(newCode);
    const storageKey = `draft_${problemId}_${selectedLanguage}`;
    localStorage.setItem(storageKey, newCode);
  };

  const handleLanguageChange = (language) => setSelectedLanguage(language);

  // --- HANDLERS: LOGOUT ---
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  // --- STRICT COLOR LOGIC ---
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
      case 'medium': return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
      case 'hard': return 'text-red-500 border-red-500/20 bg-red-500/10';
      default: return 'text-gray-400 border-gray-500/20 bg-gray-500/10';
    }
  };

  const getPointsByDifficulty = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 4;
      default: return 0;
    }
  };

  const handleAddTestCase = (failedCase) => {
    const newCase = {
      input: failedCase.input,
      output: "",
      expected_output: failedCase.expectedOutput,
      explanation: "Added from failed submission"
    };
    setCases([...cases, newCase]);
    setActiveBottomTab('testcase');
    setIsConsoleOpen(true);
    setActiveTestCaseId(cases.length);
  };

  // --- ANIMATIONS ---
  const triggerCoinAnimation = (points) => {
    if (!scoreBadgeRef.current) return;
    const destRect = scoreBadgeRef.current.getBoundingClientRect();
    const destX = destRect.left + destRect.width / 2;
    const destY = destRect.top + destRect.height / 2;
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    const newCoins = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      startX, startY, destX, destY, delay: i * 0.05
    }));
    setFlyingCoins(prev => [...prev, ...newCoins]);
  };

  const handleCoinArrival = (id) => {
    setFlyingCoins(prev => prev.filter(c => c.id !== id));
    setUserScore(prev => prev + 1);
  };

  // --- API CALLS ---
  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    setIsConsoleOpen(true);
    setActiveBottomTab('testcase');
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code, language: selectedLanguage, testCases: cases
      });
      setRunResult(response.data);
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({ success: false, error: 'Internal server error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    setIsConsoleOpen(true);
    setActiveBottomTab('result');
    try {
      // 1. Enqueue the submission — returns immediately
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code, language: selectedLanguage
      });
      const { submissionId } = response.data;

      // 2. Show "Processing..." state
      setSubmitResult({ accepted: false, status: 'queued', passedTestCases: 0, totalTestCases: 0, runtime: 0, memory: 0, error: null });

      // 3. Poll for result every 2 seconds
      const maxAttempts = 30; // Max 60 seconds
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, 2000));
        try {
          const statusRes = await axiosClient.get(`/submission/status/${submissionId}`);
          const data = statusRes.data;

          if (data.completed) {
            setSubmitResult(data);

            if (data.accepted) {
              const pointsEarned = getPointsByDifficulty(problem.difficulty);
              triggerCoinAnimation(pointsEarned);
              setShowCelebration(true);

              audioRef.current.volume = 0.5;
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(e => console.warn("Audio blocked:", e));

              setTimeout(() => setShowCelebration(false), 4000);
            }
            setLoading(false);
            return;
          }
          // Update status text while still processing
          setSubmitResult(prev => ({ ...prev, status: data.status }));
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }
      // Timed out
      setSubmitResult({ accepted: false, error: "Submission timed out. Please try again.", passedTestCases: 0, totalTestCases: 0, runtime: 0, memory: 0 });
    } catch (error) {
      console.error('Error submitting code:', error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message || "Unknown Error";
      setSubmitResult({
        accepted: false, error: "Submission Failed: " + errorMsg,
        passedTestCases: 0, totalTestCases: 0, runtime: 0, memory: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'cpp';
    }
  };

  // --- THEME VARIABLES ---
  const bgMain = isDarkMode ? 'bg-[#121212]' : 'bg-[#f8f9fa]';
  const bgPanel = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white';
  const bgHeader = isDarkMode ? 'bg-[#181818]' : 'bg-white';
  const borderColor = isDarkMode ? 'border-[#2d2d2d]' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const emeraldText = 'text-emerald-500';
  const cardBg = isDarkMode ? 'bg-white/[0.03]' : 'bg-gray-50';

  const tabInactiveBg = isDarkMode ? 'hover:bg-[#2d2d2d] text-gray-400' : 'hover:bg-gray-100 text-gray-500';
  const tabActiveBg = isDarkMode ? 'bg-[#1e1e1e] text-white border-t-2 border-emerald-500' : 'bg-white text-black border-t-2 border-emerald-500';

  // --- FILTERED PROBLEMS FOR SIDEBAR ---
  const filteredProblemList = problemList.filter(p =>
    p.title.toLowerCase().includes(sidebarSearchTerm.toLowerCase()) ||
    (p.problemNumber && p.problemNumber.toString().includes(sidebarSearchTerm))
  );

  if (loading && !problem) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${bgMain}`}>
        <div className="w-10 h-10 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${bgMain} overflow-hidden font-sans text-[13px] relative selection:bg-emerald-500/30`}>

      {/* --- ✨ CELEBRATION OVERLAY --- */}
      <AnimatePresence>
        {showCelebration && <Confetti />}
      </AnimatePresence>

      {/* --- 💰 COIN ANIMATION --- */}
      <AnimatePresence>
        {flyingCoins.map((coin) => (
          <motion.div
            key={coin.id}
            initial={{ x: coin.startX, y: coin.startY, scale: 0, opacity: 0 }}
            animate={{ x: coin.destX, y: coin.destY, scale: 1, opacity: 1, rotate: 720 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: coin.delay }}
            onAnimationComplete={() => handleCoinArrival(coin.id)}
            className="fixed z-[100] text-yellow-400 pointer-events-none drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]"
          >
            <CircleDollarSign className="w-10 h-10 fill-yellow-400 text-yellow-600" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* --- SIDEBAR PROBLEM LIST OVERLAY --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -350 }} animate={{ x: 0 }} exit={{ x: -350 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className={`fixed top-0 left-0 bottom-0 w-[350px] ${bgPanel} z-[70] border-r ${borderColor} shadow-2xl flex flex-col`}
            >
              <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${textPrimary} flex items-center gap-2`}>
                  <List className="w-4 h-4 text-emerald-500" /> Problem List
                </h3>
                <button onClick={() => setIsSidebarOpen(false)} className={`p-1 rounded hover:bg-zinc-700 text-gray-400`}>
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Search Bar */}
              <div className="p-3 border-b border-zinc-700/50">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={sidebarSearchTerm}
                    onChange={(e) => setSidebarSearchTerm(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-md ${isDarkMode ? 'bg-zinc-800 text-gray-300' : 'bg-gray-100 text-black'} outline-none focus:ring-1 focus:ring-emerald-500 transition-all`}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {problem && !sidebarSearchTerm && (
                  <div className={`p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 mb-4`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-emerald-500 font-bold text-xs">Current Problem</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className={`text-sm font-medium ${textPrimary}`}>{problem.problemNumber || currentProblemIndex + 1}. {problem.title}</div>
                  </div>
                )}

                {filteredProblemList.length > 0 ? (
                  filteredProblemList.map((p, i) => (
                    <div
                      key={p._id}
                      onClick={() => navigateToProblem(p._id)}
                      className={`p-3 rounded-md border border-transparent hover:border-zinc-700 hover:bg-zinc-800/50 cursor-pointer group transition-all 
                            ${p._id === problemId ? 'bg-zinc-800 border-zinc-700' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`${p._id === problemId ? 'text-white' : textSecondary} text-xs font-medium group-hover:text-gray-300 truncate pr-2`}>
                          {p.problemNumber || i + 1}. {p.title}
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${p.difficulty?.toLowerCase() === 'easy' ? 'text-emerald-600' :
                          p.difficulty?.toLowerCase() === 'medium' ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                          {p.difficulty}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No problems found.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <nav className={`h-[50px] ${bgHeader} border-b ${borderColor} flex items-center justify-between px-4 z-50`}>

        {/* LEFT: Logo, Menu, Nav Arrows */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Logo -> Redirect to /Homepage (Practice Route) */}
            <div
              className="w-7 h-7 bg-emerald-600 rounded flex items-center justify-center cursor-pointer shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
              onClick={() => navigate('/Homepage')}
              title="Back to Practice"
            >
              <Code2 className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>

            <div className="h-5 w-px bg-zinc-700/50"></div>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-800 transition-colors ${textSecondary} hover:text-white`}
            >
              <Menu className="w-4 h-4" />
              <span className="text-xs font-medium hidden md:inline">Problem List</span>
            </button>

            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={() => navigateToProblem(prevProblemId)}
                disabled={!prevProblemId}
                className={`p-1.5 rounded transition-colors ${!prevProblemId ? 'text-zinc-700 cursor-not-allowed' : 'hover:bg-zinc-800 text-gray-500 hover:text-white'}`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigateToProblem(nextProblemId)}
                disabled={!nextProblemId}
                className={`p-1.5 rounded transition-colors ${!nextProblemId ? 'text-zinc-700 cursor-not-allowed' : 'hover:bg-zinc-800 text-gray-500 hover:text-white'}`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* CENTER: Timer */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <Timer />
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3">

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleRun}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-medium transition-all border border-zinc-700 ${loading ? 'opacity-50' : ''}`}
          >
            <Play className="w-3.5 h-3.5 fill-current" /> <span className="hidden sm:inline">Run</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleSubmitCode}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all shadow-lg shadow-emerald-900/20 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Submit</span>
          </motion.button>

          <button onClick={toggleTheme} className={`p-2 rounded hover:bg-zinc-800 text-gray-400 hover:text-white transition-colors`}>
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Avatar - Dynamic Initials or Sign In */}
          {user ? (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[1px] cursor-pointer"
              onClick={() => navigate('/UserProfile')}
              title="My Profile"
            >
              <div className={`w-full h-full rounded-full ${bgHeader} flex items-center justify-center overflow-hidden`}>
                <div className="text-[10px] font-bold text-emerald-500">
                  {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                </div>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => navigate('/Login')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
          )}

        </div>
      </nav>

      {/* --- MAIN SPLIT LAYOUT --- */}
      <div className="flex-1 flex overflow-hidden p-1.5 gap-1.5">

        {/* --- LEFT PANEL --- */}
        <div className={`w-1/2 flex flex-col ${bgPanel} rounded-lg border ${borderColor} overflow-hidden`}>

          <div className={`flex items-center gap-1 px-2 py-1 ${isDarkMode ? 'bg-[#181818]' : 'bg-gray-100'} border-b ${borderColor} overflow-x-auto no-scrollbar`}>
            {[
              { key: 'description', label: 'Description', icon: FileText },
              { key: 'editorial', label: 'Editorial', icon: BookOpen },
              { key: 'solutions', label: 'Solutions', icon: Code2 },
              { key: 'submissions', label: 'Submissions', icon: Activity },
              { key: 'chatAI', label: 'AI Helper', icon: Wand2 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveLeftTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-md transition-all whitespace-nowrap ${activeLeftTab === tab.key ? tabActiveBg : tabInactiveBg}`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${activeLeftTab === tab.key ? 'text-emerald-500' : ''}`} /> {tab.label}
              </button>
            ))}
          </div>

          <div className={`flex-1 ${activeLeftTab === 'chatAI' ? 'p-0 overflow-hidden' : 'p-4 overflow-y-auto custom-scrollbar'}`}>
            <AnimatePresence mode="wait">
              {problem && (
                <motion.div
                  key={activeLeftTab}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="h-full flex flex-col"
                >
                  {activeLeftTab === 'description' && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h1 className={`text-xl font-bold ${textPrimary}`}>{problem.problemNumber || currentProblemIndex + 1}. {problem.title}</h1>
                          <div className="flex gap-2">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${getDifficultyColor(problem.difficulty)}`}>
                              {problem.difficulty}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 border-b border-zinc-700/50 pb-4">
                          <span className="flex items-center gap-1 text-emerald-500"><CheckCircle className="w-3 h-3" /> Solved</span>
                          <span ref={scoreBadgeRef} className="flex items-center gap-1 transition-all"><Trophy className="w-3 h-3 text-yellow-500" /> +{getPointsByDifficulty(problem.difficulty)} Pts</span>
                          <span className="bg-zinc-800 px-2 py-0.5 rounded text-gray-400">{problem.tags}</span>
                        </div>
                      </div>

                      {/* --- TYPOGRAPHY IMPROVEMENT: ADDED font-mono and .replace() --- */}
                      <div className={`${textPrimary} text-[15px] leading-relaxed whitespace-pre-wrap font-mono selection:bg-emerald-500/30`}>
                        {problem.description.replace(/\\n/g, '\n')}
                      </div>

                      <div className="space-y-6">
                        {problem.visibleTestCases?.map((example, index) => (
                          <div key={index} className="space-y-2">
                            <h3 className={`font-bold ${textPrimary} text-sm`}>Example {index + 1}:</h3>
                            <div className={`pl-3 border-l-2 ${isDarkMode ? 'border-zinc-700' : 'border-gray-300'} space-y-2`}>
                              <div className="flex gap-2 items-start">
                                <span className={`font-mono font-bold text-xs ${textSecondary} w-12 mt-0.5`}>Input:</span>
                                <code className={`font-mono text-xs ${textPrimary} bg-zinc-800/50 px-2 py-1 rounded whitespace-pre-wrap leading-tight block`}>
                                  {example.input.replace(/\\n/g, '\n')}
                                </code>
                              </div>
                              <div className="flex gap-2 items-start">
                                <span className={`font-mono font-bold text-xs ${textSecondary} w-12 mt-0.5`}>Output:</span>
                                {/* THIS FIXES THE PYRAMID DISPLAY ISSUE */}
                                <code className={`font-mono text-xs ${textPrimary} bg-zinc-800/50 px-2 py-1 rounded whitespace-pre-wrap leading-tight block`}>
                                  {example.output.replace(/\\n/g, '\n')}
                                </code>
                              </div>
                              {example.explanation && (
                                <div className="flex gap-2 items-start">
                                  <span className={`font-mono font-bold text-xs ${textSecondary} w-12`}>Expl:</span>
                                  <span className={`text-xs ${textSecondary} italic`}>{example.explanation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ... (Editorial, Solutions, Submissions, ChatAI remain same) ... */}
                  {activeLeftTab === 'editorial' && (
                    <div className="prose prose-invert max-w-none prose-sm">
                      {solutionUnlocked && unlockedSolution?.video ? (
                        <Editorial
                          secureUrl={unlockedSolution.video.secureUrl}
                          thumbnailUrl={unlockedSolution.video.thumbnailUrl}
                          duration={unlockedSolution.video.duration}
                        />
                      ) : problem?.hasSolutionVideo ? (
                        <SolutionLock
                          problemId={problemId}
                          hasSolutionVideo={problem.hasSolutionVideo}
                          onUnlock={(data) => {
                            setUnlockedSolution(data);
                            setSolutionUnlocked(true);
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
                          <BookOpen className="w-8 h-8 mb-2 opacity-50" /> No video explanation available
                        </div>
                      )}
                    </div>
                  )}

                  {activeLeftTab === 'solutions' && (
                    <div className="flex flex-col h-full overflow-hidden">
                      {solutionUnlocked && unlockedSolution?.referenceSolution ? (
                        <>
                          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                            {unlockedSolution.referenceSolution.map((sol, index) => (
                              <button
                                key={index}
                                onClick={() => setActiveSolIndex(index)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${activeSolIndex === index ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'text-gray-500 border-transparent hover:bg-zinc-800'}`}
                              >
                                {sol.language === 'cpp' ? 'C++' : sol.language === 'javascript' ? 'JavaScript' : sol.language.charAt(0).toUpperCase() + sol.language.slice(1)}
                              </button>
                            ))}
                          </div>
                          {unlockedSolution.referenceSolution[activeSolIndex] ? (
                            <div className={`relative flex-1 rounded-xl border ${borderColor} ${isDarkMode ? 'bg-[#181818]' : 'bg-gray-50'} group overflow-hidden`}>
                              <CopyButton code={formatCode(unlockedSolution.referenceSolution[activeSolIndex].completeCode)} />
                              <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                                <pre className={`text-[13px] font-mono leading-relaxed whitespace-pre-wrap ${textSecondary}`}>
                                  {formatCode(unlockedSolution.referenceSolution[activeSolIndex].completeCode)}
                                </pre>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
                              <Code2 className="w-8 h-8 mb-2 opacity-50" /> No solutions available
                            </div>
                          )}
                        </>
                      ) : (
                        <SolutionLock
                          problemId={problemId}
                          hasSolutionVideo={problem?.hasSolutionVideo}
                          onUnlock={(data) => {
                            setUnlockedSolution(data);
                            setSolutionUnlocked(true);
                          }}
                        />
                      )}
                    </div>
                  )}

                  {activeLeftTab === 'submissions' && <SubmissionHistory problemId={problemId} />}
                  {activeLeftTab === 'chatAI' && <ChatAi problem={problem} editorRef={editorRef} />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- RIGHT PANEL (Editor & Console) --- */}
        <div className="w-1/2 flex flex-col gap-1.5 h-full">

          {/* Editor Section */}
          <div className={`flex-1 flex flex-col ${bgPanel} rounded-lg border ${borderColor} overflow-hidden min-h-0`}>
            <div className={`flex items-center justify-between px-3 py-1.5 border-b ${borderColor} ${bgHeader}`}>
              <div className="flex items-center gap-2">
                <Code2 className={`w-4 h-4 ${emeraldText}`} />
                <span className={`text-xs font-bold ${emeraldText}`}>Code</span>
                <div className="h-4 w-px bg-zinc-700 mx-1"></div>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className={`bg-transparent text-xs ${textPrimary} outline-none cursor-pointer hover:text-white font-medium`}
                >
                  <option value="javascript" className="text-black">JavaScript</option>
                  <option value="java" className="text-black">Java</option>
                  <option value="cpp" className="text-black">C++</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleFormat} className={`p-1.5 rounded hover:bg-zinc-700 text-gray-400 hover:text-white transition-colors`}>
                  <Wand2 className="w-3.5 h-3.5" />
                </button>
                <button className={`p-1.5 rounded hover:bg-zinc-700 text-gray-400 hover:text-white transition-colors`}>
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 relative min-h-0">
              <Editor
                height="100%"
                language={getLanguageForMonaco(selectedLanguage)}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={isDarkMode ? "vs-dark" : "light"}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                  renderLineHighlight: 'line',
                  folding: true,
                }}
              />
            </div>
          </div>

          {/* Console Section */}
          <div className={`flex flex-col ${bgPanel} rounded-lg border ${borderColor} overflow-hidden transition-all duration-300 ${isConsoleOpen ? 'h-[40%]' : 'h-[36px]'}`}>
            <div
              className={`flex items-center justify-between px-4 py-2 ${bgHeader} border-b ${borderColor} cursor-pointer select-none`}
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            >
              <div className="flex items-center gap-4">
                <button className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isConsoleOpen && activeBottomTab === 'testcase' ? 'text-white' : textSecondary}`}>
                  <div className="flex items-center gap-1.5" onClick={(e) => { e.stopPropagation(); setActiveBottomTab('testcase'); setIsConsoleOpen(true); }}>
                    <CheckCircle className="w-3.5 h-3.5" /> Testcase
                  </div>
                </button>
                <div className="h-3 w-px bg-zinc-700"></div>
                <button className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isConsoleOpen && activeBottomTab === 'result' ? emeraldText : textSecondary}`}>
                  <div className="flex items-center gap-1.5" onClick={(e) => { e.stopPropagation(); setActiveBottomTab('result'); setIsConsoleOpen(true); }}>
                    <Zap className="w-3.5 h-3.5" /> Result
                  </div>
                </button>
              </div>
              <button className="text-gray-400 hover:text-white">
                <ChevronDown className={`w-4 h-4 transition-transform ${isConsoleOpen ? '' : 'rotate-180'}`} />
              </button>
            </div>

            {isConsoleOpen && (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeBottomTab === 'testcase' && (
                  <div className="space-y-4">

                    {/* --- 🔴 GLOBAL ERROR BANNER (Compilation/Server Error) --- */}
                    {runResult?.error && (
                      <div className="w-full text-left animate-in fade-in slide-in-from-bottom-2 mb-4">
                        <h5 className="text-xs font-bold text-red-400 flex items-center gap-2 mb-2">
                          <ShieldAlert className="w-4 h-4" />
                          {runResult.testCases?.length > 0 ? "Execution Error" : "Compilation Error"}
                        </h5>
                        <div className={`p-3 rounded-lg border border-red-500/30 bg-red-950/30 font-mono text-xs text-red-200 whitespace-pre-wrap`}>
                          {runResult.error}
                        </div>
                      </div>
                    )}

                    {/* --- 🟢 TEST CASE TABS --- */}
                    <div className="flex items-center gap-2 border-b border-zinc-700/50 pb-2 mb-4 overflow-x-auto">
                      {cases.map((tc, i) => {
                        const resultCase = runResult?.testCases?.[i];
                        // Determine status color: Green (Pass), Red (Fail/Error)
                        const isError = resultCase?.status_id >= 5; // 5=TLE, 6=Compile, 7+=Runtime
                        const isPass = resultCase?.isCorrect === true;

                        return (
                          <button
                            key={i}
                            onClick={() => setActiveTestCaseId(i)}
                            className={`relative px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 
                              ${activeTestCaseId === i
                                ? (isDarkMode ? 'bg-zinc-700 text-white' : 'bg-gray-200 text-black')
                                : 'text-gray-500 hover:text-gray-300'
                              }`}
                          >
                            {/* Status Dot */}
                            {runResult && resultCase && (
                              <div className={`w-1.5 h-1.5 rounded-full ${isError ? 'bg-orange-500' : (isPass ? 'bg-emerald-500' : 'bg-red-500')}`}></div>
                            )}
                            Case {i + 1}
                          </button>
                        );
                      })}
                      <button onClick={() => { setCases([...cases, { input: "", output: "" }]); setActiveTestCaseId(cases.length); }} className="px-2 text-gray-500 hover:text-emerald-500 transition-colors">+</button>
                    </div>

                    {/* --- CASE DETAILS --- */}
                    {(() => {
                      const currentCase = cases[activeTestCaseId];
                      const resultCase = runResult?.testCases?.[activeTestCaseId];

                      if (!currentCase) return <div className="text-gray-500 text-xs">No case selected</div>;

                      return (
                        <div className="space-y-4 font-mono text-sm">
                          {/* INPUT */}
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500 font-sans">Input:</div>
                            <textarea
                              className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-[#181818] text-gray-300' : 'bg-white'} border ${borderColor} outline-none resize-y min-h-[50px] focus:border-emerald-500/50 transition-colors`}
                              value={currentCase.input}
                              onChange={(e) => {
                                const updated = [...cases];
                                updated[activeTestCaseId].input = e.target.value;
                                setCases(updated);
                              }}
                            />
                          </div>

                          {/* OUTPUT / ERROR */}
                          {runResult && resultCase && (
                            <>
                              <div className="space-y-1">
                                <div className="text-xs text-gray-500 font-sans flex justify-between">
                                  <span>Output:</span>
                                  {/* Show Status Label if Error */}
                                  {!resultCase.isCorrect && (
                                    <span className="text-red-400 font-bold">{resultCase.status_description}</span>
                                  )}
                                </div>

                                <div className={`p-3 rounded-lg border whitespace-pre-wrap 
                                  ${resultCase.isCorrect
                                    ? `border-emerald-500/30 ${isDarkMode ? 'bg-[#181818] text-gray-300' : 'bg-white text-black'}`
                                    : `border-red-500/30 bg-red-900/10 text-red-200`
                                  }`}
                                >
                                  {/* If error, backend puts stderr in output. If pass, it's stdout. */}
                                  {resultCase.output}
                                </div>
                              </div>

                              {/* EXPECTED OUTPUT (Only show if no runtime error) */}
                              {resultCase.status_id === 3 || resultCase.status_id === 4 ? (
                                <div className="space-y-1">
                                  <div className="text-xs text-gray-500 font-sans">Expected:</div>
                                  <div className={`p-3 rounded-lg border ${borderColor} whitespace-pre-wrap ${isDarkMode ? 'bg-[#181818] text-gray-300' : 'bg-white text-black'}`}>
                                    {resultCase.expectedOutput}
                                  </div>
                                </div>
                              ) : null}
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* --- RESULT TAB (Submit Results) --- */}
                {activeBottomTab === 'result' && (
                  <div className="h-full">
                    {submitResult ? (
                      <div className="flex flex-col items-center w-full space-y-6">

                        {/* Processing State */}
                        {['queued', 'processing', 'pending'].includes(submitResult.status) ? (
                          <div className="w-full border rounded-xl p-8 text-center bg-blue-500/5 border-blue-500/20">
                            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                            <h4 className="text-lg font-bold text-blue-400 capitalize">{submitResult.status === 'queued' ? 'In Queue...' : 'Processing...'}</h4>
                            <p className="text-xs text-gray-500 mt-1">Your code is being evaluated</p>
                          </div>
                        ) : (
                          <>
                            {/* Status Card */}
                            <div className={`w-full border rounded-xl p-6 text-center relative overflow-hidden 
                          ${submitResult.accepted
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-red-500/5 border-red-500/20'
                              }`}
                            >
                              <h4 className={`text-xl font-bold mb-1 ${submitResult.accepted ? 'text-emerald-400' : 'text-red-400'}`}>
                                {submitResult.accepted ? 'Accepted' : (submitResult.error ? 'Execution Error' : 'Wrong Answer')}
                              </h4>

                              {/* Stats (Hide if critical error) */}
                              {!submitResult.error && (
                                <div className="flex justify-center gap-4 text-xs text-gray-400 mt-2">
                                  <span>Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</span>
                                  <span>Runtime: {submitResult.runtime || 'N/A'}ms</span>
                                </div>
                              )}
                            </div>

                            {/* Success Stats */}
                            {submitResult.accepted && (
                              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                <div className={`${cardBg} border ${borderColor} rounded-lg px-4 py-3`}>
                                  <div className={`text-[10px] uppercase tracking-wider ${textSecondary} mb-1`}>Runtime</div>
                                  <div className={`text-xl font-bold ${textPrimary}`}>{submitResult.runtime}ms</div>
                                  <div className="text-[10px] text-emerald-500">Beats 85%</div>
                                </div>
                                <div className={`${cardBg} border ${borderColor} rounded-lg px-4 py-3`}>
                                  <div className={`text-[10px] uppercase tracking-wider ${textSecondary} mb-1`}>Memory</div>
                                  <div className={`text-xl font-bold ${textPrimary}`}>{submitResult.memory}KB</div>
                                  <div className="text-[10px] text-emerald-500">Beats 92%</div>
                                </div>
                              </div>
                            )}

                            {/* ERROR LOG (Compilation / Runtime) */}
                            {!submitResult.accepted && submitResult.error && (
                              <div className="w-full text-left space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                <h5 className="text-xs font-bold text-red-400 flex items-center gap-2">
                                  <ShieldAlert className="w-4 h-4" /> Error Log
                                </h5>
                                <div className={`p-4 rounded-lg border border-red-500/30 bg-red-950/30 font-mono text-xs text-red-200 whitespace-pre-wrap overflow-x-auto`}>
                                  {submitResult.error}
                                </div>
                              </div>
                            )}

                            {/* Failed Input (Logic Error) */}
                            {!submitResult.accepted && !submitResult.error && submitResult.failedCase && (
                              <div className="w-full text-left space-y-2">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-xs font-bold text-red-400">Last Executed Input</h5>
                                  <button
                                    onClick={() => handleAddTestCase(submitResult.failedCase)}
                                    className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-gray-300 px-2 py-1 rounded border border-zinc-700 transition-colors"
                                  >
                                    Add to Testcase
                                  </button>
                                </div>
                                <div className={`p-3 rounded-lg border ${borderColor} bg-zinc-900/50 font-mono text-xs space-y-2`}>
                                  <div className="text-gray-500">Input: <span className="text-gray-300">{submitResult.failedCase.input}</span></div>
                                  <div className="text-gray-500">Output: <span className="text-red-400">{submitResult.failedCase.output}</span></div>
                                  <div className="text-gray-500">Expected: <span className="text-emerald-400">{submitResult.failedCase.expectedOutput}</span></div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 min-h-[150px]">
                        <div className="text-sm">Run your code to see results</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;