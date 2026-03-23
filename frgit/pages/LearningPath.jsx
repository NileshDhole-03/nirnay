import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, ChevronRight, CheckCircle2, Circle, Trophy,
    Target, Flame, BookOpen, ArrowLeft, RotateCcw, Sparkles
} from 'lucide-react';
import learningPathData from '../data/learningPathData';

const STORAGE_KEY = 'niyati-learning-path-progress';

const getDiffColor = (diff) => {
    switch (diff) {
        case 'easy': return { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', bar: 'bg-sky-500' };
        case 'medium': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', bar: 'bg-amber-500' };
        case 'hard': return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', bar: 'bg-rose-500' };
        default: return { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20', bar: 'bg-zinc-500' };
    }
};

const phaseColors = [
    'from-emerald-500 to-cyan-500',
    'from-blue-500 to-indigo-500',
    'from-violet-500 to-purple-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-cyan-500 to-teal-500',
    'from-indigo-500 to-blue-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-emerald-500',
];

function LearningPath() {
    const navigate = useNavigate();
    const [completed, setCompleted] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch { return {}; }
    });
    const [expandedPhases, setExpandedPhases] = useState({ 'phase-1': true });
    const [expandedTopics, setExpandedTopics] = useState({});

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }, [completed]);

    const toggleProblem = (phaseId, topicId, problemIdx) => {
        const key = `${phaseId}-${topicId}-${problemIdx}`;
        setCompleted(prev => {
            const next = { ...prev };
            if (next[key]) delete next[key]; else next[key] = true;
            return next;
        });
    };

    const togglePhase = (phaseId) => {
        setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
    };

    const toggleTopic = (topicId) => {
        setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
    };

    // Stats
    const stats = useMemo(() => {
        let total = 0, done = 0;
        const phaseStats = {};
        learningPathData.forEach(phase => {
            let pTotal = 0, pDone = 0;
            phase.topics.forEach(topic => {
                topic.problems.forEach((_, idx) => {
                    total++; pTotal++;
                    const key = `${phase.id}-${topic.id}-${idx}`;
                    if (completed[key]) { done++; pDone++; }
                });
            });
            phaseStats[phase.id] = { total: pTotal, done: pDone, pct: pTotal ? Math.round((pDone / pTotal) * 100) : 0 };
        });
        return { total, done, pct: total ? Math.round((done / total) * 100) : 0, phases: phaseStats };
    }, [completed]);

    const resetProgress = () => {
        if (window.confirm('Reset all progress? This cannot be undone.')) {
            setCompleted({});
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white font-sans">

            {/* Background glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/Homepage')} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold">
                                <span className="text-emerald-400">Nirnay</span> DSA Flow
                            </h1>
                            <p className="text-xs text-zinc-500 hidden sm:block">529 problems • Structured flow • Track your progress</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={resetProgress} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-rose-400" title="Reset progress">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Overall Progress Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#18181b] border border-zinc-800 rounded-2xl p-5 sm:p-6"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-white">Overall Progress</h2>
                                <p className="text-xs text-zinc-500">{stats.done} of {stats.total} problems completed</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-emerald-400">{stats.pct}%</span>
                        </div>
                    </div>

                    {/* Overall progress bar */}
                    <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.pct}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                        />
                    </div>

                    {/* Quick phase stats */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
                        {learningPathData.slice(0, 5).map((phase, i) => {
                            const ps = stats.phases[phase.id];
                            return (
                                <div key={phase.id} className="text-center">
                                    <div className="text-xs text-zinc-500 mb-1 truncate">P{phase.phase}</div>
                                    <div className="text-sm font-bold text-zinc-300">{ps.pct}%</div>
                                    <div className="h-1 w-full bg-zinc-800 rounded-full mt-1 overflow-hidden">
                                        <div className={`h-full bg-gradient-to-r ${phaseColors[i]} rounded-full transition-all duration-500`} style={{ width: `${ps.pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Phases */}
                {learningPathData.map((phase, phaseIdx) => {
                    const ps = stats.phases[phase.id];
                    const isExpanded = expandedPhases[phase.id];

                    return (
                        <motion.div
                            key={phase.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: phaseIdx * 0.05 }}
                            className="bg-[#18181b] border border-zinc-800 rounded-2xl overflow-hidden"
                        >
                            {/* Phase Header */}
                            <button
                                onClick={() => togglePhase(phase.id)}
                                className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-zinc-800/30 transition-colors text-left"
                            >
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${phaseColors[phaseIdx % phaseColors.length]} flex items-center justify-center text-lg sm:text-xl flex-shrink-0 shadow-lg`}>
                                    {phase.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Phase {phase.phase}</span>
                                        {ps.pct === 100 && <Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
                                    </div>
                                    <h3 className="font-bold text-white text-sm sm:text-base truncate">{phase.title}</h3>
                                    <p className="text-xs text-zinc-500 hidden sm:block">{phase.description}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-right hidden sm:block">
                                        <span className="text-sm font-bold text-zinc-300">{ps.done}/{ps.total}</span>
                                        <div className="w-20 h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                                            <div className={`h-full bg-gradient-to-r ${phaseColors[phaseIdx % phaseColors.length]} rounded-full transition-all duration-500`} style={{ width: `${ps.pct}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-400 sm:hidden">{ps.pct}%</span>
                                    {isExpanded ? <ChevronDown className="w-5 h-5 text-zinc-500" /> : <ChevronRight className="w-5 h-5 text-zinc-500" />}
                                </div>
                            </button>

                            {/* Phase Content */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
                                            {phase.topics.map(topic => {
                                                const topicKey = `${phase.id}-${topic.id}`;
                                                const isTopicExpanded = expandedTopics[topicKey] !== false; // default open
                                                const topicDone = topic.problems.filter((_, idx) => completed[`${phase.id}-${topic.id}-${idx}`]).length;
                                                const topicPct = topic.problems.length ? Math.round((topicDone / topic.problems.length) * 100) : 0;

                                                return (
                                                    <div key={topic.id} className="bg-[#0f0f12] border border-zinc-800/50 rounded-xl overflow-hidden">
                                                        {/* Topic Header */}
                                                        <button
                                                            onClick={() => toggleTopic(topicKey)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/20 transition-colors text-left"
                                                        >
                                                            <BookOpen className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                                                            <span className="flex-1 text-sm font-semibold text-zinc-200 truncate">{topic.title}</span>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <span className="text-xs text-zinc-500">{topicDone}/{topic.problems.length}</span>
                                                                <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
                                                                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${topicPct}%` }} />
                                                                </div>
                                                                {isTopicExpanded ? <ChevronDown className="w-4 h-4 text-zinc-600" /> : <ChevronRight className="w-4 h-4 text-zinc-600" />}
                                                            </div>
                                                        </button>

                                                        {/* Problems List */}
                                                        <AnimatePresence>
                                                            {isTopicExpanded && (
                                                                <motion.div
                                                                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="border-t border-zinc-800/30">
                                                                        {topic.problems.map((problem, idx) => {
                                                                            const key = `${phase.id}-${topic.id}-${idx}`;
                                                                            const isDone = !!completed[key];
                                                                            const dc = getDiffColor(problem.diff);

                                                                            return (
                                                                                <div
                                                                                    key={idx}
                                                                                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/20 transition-all group cursor-pointer border-b border-zinc-800/20 last:border-b-0 ${isDone ? 'opacity-60' : ''}`}
                                                                                    onClick={() => toggleProblem(phase.id, topic.id, idx)}
                                                                                >
                                                                                    {/* Checkbox */}
                                                                                    <div className="flex-shrink-0">
                                                                                        {isDone ? (
                                                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                                                        ) : (
                                                                                            <Circle className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Number */}
                                                                                    <span className="text-xs text-zinc-600 font-mono w-6 text-right flex-shrink-0">{idx + 1}</span>

                                                                                    {/* Title */}
                                                                                    <span className={`flex-1 text-sm truncate ${isDone ? 'line-through text-zinc-500' : 'text-zinc-300 group-hover:text-white'} transition-colors`}>
                                                                                        {problem.title}
                                                                                    </span>

                                                                                    {/* Concept */}
                                                                                    <span className="text-[10px] text-zinc-600 hidden md:block max-w-[120px] truncate">{problem.concept}</span>

                                                                                    {/* Difficulty Badge */}
                                                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${dc.bg} ${dc.text} border ${dc.border} flex-shrink-0`}>
                                                                                        {problem.diff}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}

                {/* Footer */}
                <div className="text-center py-8 text-zinc-600 text-xs">
                    <p>🗺️ Nirnay DSA Flow • 529 Problems • {stats.done} Completed</p>
                    <p className="mt-1">Progress saved locally in your browser</p>
                </div>
            </div>
        </div>
    );
}

export default LearningPath;
