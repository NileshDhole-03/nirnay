import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import { ActivityCalendar } from 'react-activity-calendar';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import {
  Trophy, Flame, Activity, CheckCircle2, XCircle,
  Clock, MapPin, Calendar, Code2, Zap, Award, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Sub-Components (Kept same as before) ---
const CircleProgress = ({ percentage, color, label, count, total, icon: Icon }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center group relative">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full blur-md opacity-20 ${color.replace('text-', 'bg-')}`}></div>
        <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
          <circle cx="48" cy="48" r={radius} stroke="#27272a" strokeWidth="6" fill="transparent" />
          <circle
            cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
             {Icon && <Icon className={`w-5 h-5 mb-1 ${color} opacity-80`} />}
            <span className="text-sm font-bold text-white">{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className={`text-sm font-semibold block ${color} tracking-wide`}>{label}</span>
        <span className="text-xs text-gray-400 font-medium">{count} / {total}</span>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, subtext, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay }}
        className="bg-[#18181b] border border-[#27272a] p-5 rounded-2xl relative overflow-hidden group hover:border-[#3f3f46] transition-all duration-300"
    >
        <div className={`absolute top-0 right-0 p-20 ${color.replace('text-', 'bg-')} opacity-[0.03] rounded-bl-full group-hover:opacity-[0.06] transition-all`}></div>
        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-xl bg-[#27272a] ${color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
                {subtext && <p className="text-[10px] text-gray-500 mt-1">{subtext}</p>}
            </div>
        </div>
    </motion.div>
);

function UserProfile() {
  const { userId } = useParams();
  const { user: loggedInUser } = useSelector((state) => state.auth);
  
  const [displayUser, setDisplayUser] = useState(null);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !userId || (loggedInUser && loggedInUser._id === userId);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isOwnProfile) {
            // --- MODE A: MY PROFILE ---
            if (loggedInUser) {
                setDisplayUser(loggedInUser);
                // Private API (Returns array of submissions)
                const { data } = await axiosClient.get('/submission/getproblemSolvedByUser');
                setSolvedProblems(data);
            }
        } else {
            // --- MODE B: PUBLIC PROFILE ---
            // Public API (Returns { user, submissions })
            const { data } = await axiosClient.get(`/user/profile/${userId}`);
            
            // ✅ Set User Info
            setDisplayUser(data.user);
            
            // ✅ Set Submissions (Now includes language!)
            setSolvedProblems(data.submissions || []);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, loggedInUser, isOwnProfile]);

  // --- STATS LOGIC (Uses solvedProblems which now has consistent data) ---
  const stats = useMemo(() => {
     const heatmap = [];
    const today = new Date(); 
    for (let i = 365; i >= 0; i--) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        heatmap.push({ date, count: 0, level: 0 });
    }

    if (!solvedProblems || !solvedProblems.length) {
        return { streak: 0, maxStreak: 0, total: 0, heatmap, topics: [], recent: [], difficulty: { easy: 0, medium: 0, hard: 0 } };
    }

    const validSubmissions = solvedProblems.filter(s => s.status && s.status.toLowerCase() === 'accepted');
    const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    const activeDates = new Set();
    const topicCounts = {}; 
    const processedProblemIds = new Set();

    validSubmissions.forEach(sub => {
        // Handle case where problemId might be populated or just an ID
         const p = sub.problemId;
        if (!p) return;
        
        // Use ID check to avoid double counting same problem
        const pId = p._id || p; 
        if (!processedProblemIds.has(pId)) {
            processedProblemIds.add(pId);
            
            const diff = p.difficulty?.toLowerCase() || 'medium';
            if (difficultyCounts[diff] !== undefined) difficultyCounts[diff]++;
            
            let rawTags = p.tags;
            if (typeof rawTags === 'string') rawTags = rawTags.includes(',') ? rawTags.split(',') : [rawTags];
            if (!Array.isArray(rawTags)) rawTags = [];
            
            rawTags.forEach(t => {
                if (t && typeof t === 'string') {
                    const cleanTag = t.trim();
                    const formattedTag = cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1).toLowerCase();
                    if (formattedTag) topicCounts[formattedTag] = (topicCounts[formattedTag] || 0) + 1;
                }
            });
        }
    });
    
    // Calculate Heatmap & Streak based on Submission Date
    solvedProblems.forEach(sub => {
         if (sub.createdAt && sub.status?.toLowerCase() === 'accepted') {
             try {
                 const date = sub.createdAt.split('T')[0];
                 activeDates.add(date);
                 const existingDay = heatmap.find(day => day.date === date);
                 if(existingDay) { existingDay.count++; existingDay.level = Math.min(existingDay.count, 4); }
             } catch(e){}
         }
    });

    const sortedDates = Array.from(activeDates).sort((a, b) => new Date(a) - new Date(b));
    let maxStreak = 0, tempStreak = 0, currentStreak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) tempStreak = 1;
        else {
            const diff = differenceInDays(parseISO(sortedDates[i]), parseISO(sortedDates[i-1]));
            tempStreak = (diff === 1) ? tempStreak + 1 : 1;
        }
        maxStreak = Math.max(maxStreak, tempStreak);
    }
    
     if (sortedDates.length > 0) {
        const lastActive = sortedDates[sortedDates.length - 1];
        const realToday = new Date(); 
        const todayStr = realToday.toISOString().split('T')[0];
        const yesterdayStr = format(subDays(realToday, 1), 'yyyy-MM-dd');
        
        if (lastActive === todayStr || lastActive === yesterdayStr) {
             currentStreak = 1;
             for (let i = sortedDates.length - 1; i > 0; i--) {
                if (differenceInDays(parseISO(sortedDates[i]), parseISO(sortedDates[i-1])) === 1) currentStreak++;
                else break;
             }
        }
    }

    const topics = Object.entries(topicCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, count]) => ({
        name, count, level: count > 10 ? "Expert" : count > 5 ? "Skilled" : "Learning"
    }));

    const recent = solvedProblems.slice(0, 5).map(sub => {
        let formattedTime = "Unknown";
        try { if (sub.createdAt) formattedTime = format(parseISO(sub.createdAt), 'MMM d, yyyy'); } catch (e) {}
        const isAccepted = sub.status && sub.status.toLowerCase() === 'accepted';
        return {
            id: sub._id,
            problem: sub.problemId?.title || "Unknown Problem",
            status: isAccepted ? "Accepted" : "Wrong Answer",
            language: sub.language || "N/A", // ✅ Now this will work!
            time: formattedTime,
            isAccepted: isAccepted,
            difficulty: sub.problemId?.difficulty || "Medium"
        };
    });

    return { streak: currentStreak, maxStreak, total: processedProblemIds.size, heatmap, topics, recent, difficulty: difficultyCounts };
  }, [solvedProblems]);

  if (loading) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-emerald-500 font-medium animate-pulse">Loading Profile...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-24 pb-12 px-4 md:px-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN --- */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* Identity Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                className="bg-[#18181b] border border-[#27272a] rounded-2xl p-0 shadow-xl overflow-hidden relative group"
            >
                <div className="h-32 bg-gradient-to-br from-emerald-900 via-emerald-950 to-[#18181b] relative">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                </div>

                <div className="px-6 pb-8 relative">
                    <div className="relative -mt-16 mb-4 flex justify-center">
                        <div className="w-32 h-32 rounded-full bg-[#18181b] p-1.5 shadow-2xl">
                             <div className="w-full h-full rounded-full bg-[#27272a] flex items-center justify-center text-5xl font-bold text-emerald-500 border border-[#3f3f46]">
                                {displayUser?.firstName?.[0]?.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            {displayUser?.firstName} {displayUser?.lastName}
                        </h1>
                        <p className="text-sm text-gray-400 font-medium">{displayUser?.emailId}</p>
                        
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-2">
                             <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> India</span>
                             <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined 2025</span>
                        </div>

                        <p className="text-sm text-gray-400 mt-4 px-4 leading-relaxed italic">
                           "Passionate developer exploring algorithms and system design."
                        </p>
                    </div>
                    
                    {isOwnProfile && (
                        <div className="mt-8 flex gap-3">
                             <button className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-900/20">
                                Edit Profile
                             </button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Progress Overview */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.1}} 
                className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl"
            >
                <div className="flex items-center justify-between mb-8">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-500" /> Mastery
                     </h3>
                     <span className="text-xs font-mono text-gray-500 bg-[#27272a] px-2 py-1 rounded">
                        Total: {stats.total}
                     </span>
                </div>
                
                <div className="flex justify-between px-2">
                    <CircleProgress percentage={(stats.difficulty.easy / (stats.total || 1)) * 100} color="text-emerald-500" label="Easy" count={stats.difficulty.easy} total={stats.total} icon={Zap} />
                    <CircleProgress percentage={(stats.difficulty.medium / (stats.total || 1)) * 100} color="text-yellow-500" label="Medium" count={stats.difficulty.medium} total={stats.total} icon={Code2} />
                    <CircleProgress percentage={(stats.difficulty.hard / (stats.total || 1)) * 100} color="text-red-500" label="Hard" count={stats.difficulty.hard} total={stats.total} icon={Trophy} />
                </div>
            </motion.div>

            {/* Top Skills */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.2}} 
                className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl"
            >
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" /> Top Skills
                </h3>
                
                <div className="space-y-4">
                    {stats.topics.length === 0 ? 
                        <div className="text-center py-6 text-gray-500 text-sm italic border border-dashed border-[#27272a] rounded-xl">
                            Solve problems to unlock skills
                        </div> 
                    : stats.topics.map((topic, i) => (
                        <div key={i} className="group">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-300 group-hover:text-emerald-400 transition-colors">
                                    {topic.name}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                    topic.level === 'Expert' ? 'border-purple-500/20 text-purple-400 bg-purple-500/10' :
                                    topic.level === 'Skilled' ? 'border-blue-500/20 text-blue-400 bg-blue-500/10' :
                                    'border-gray-600 text-gray-400 bg-[#27272a]'
                                }`}>
                                    {topic.level}
                                </span>
                             </div>
                             <div className="w-full h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((topic.count / 15) * 100, 100)}%` }}
                                    transition={{ duration: 1, delay: 0.3 + (i*0.1) }}
                                    className={`h-full rounded-full ${
                                        topic.level === 'Expert' ? 'bg-purple-500' :
                                        topic.level === 'Skilled' ? 'bg-blue-500' : 'bg-gray-500'
                                    }`}
                                 />
                             </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={Trophy} label="Total Solved" value={stats.total} subtext="Keep pushing!" color="text-emerald-500" delay={0} />
                <StatCard icon={Flame} label="Current Streak" value={stats.streak} subtext="Days in a row" color="text-orange-500" delay={0.1} />
                <StatCard icon={Activity} label="Max Streak" value={stats.maxStreak} subtext="All time best" color="text-blue-500" delay={0.2} />
            </div>

            {/* Heatmap */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.3}} 
                className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Submission Activity</h3>
                        <p className="text-xs text-gray-500 mt-1">Activity Log</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-[#27272a]/50 p-2 rounded-lg border border-[#27272a]">
                        <span>Less</span>
                        {[0, 1, 2, 3, 4].map(level => (
                             <div key={level} className={`w-2.5 h-2.5 rounded-sm ${
                                 level === 0 ? 'bg-[#27272a]' : 
                                 level === 1 ? 'bg-[#064e3b]' :
                                 level === 2 ? 'bg-[#065f46]' :
                                 level === 3 ? 'bg-[#059669]' : 'bg-[#10b981]'
                             }`} />
                        ))}
                        <span>More</span>
                    </div>
                </div>
                
                <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                    <ActivityCalendar 
                        data={stats.heatmap}
                        labels={{ totalCount: '{{count}} activities' }}
                        theme={{
                            light: ['#27272a', '#064e3b', '#065f46', '#059669', '#10b981'],
                            dark: ['#27272a', '#064e3b', '#065f46', '#059669', '#10b981'],
                        }}
                        colorScheme="dark"
                        blockSize={13}
                        blockMargin={4}
                        fontSize={12}
                        showWeekdayLabels
                        renderBlock={(block, activity) => (
                            React.cloneElement(block, {
                                'data-tooltip-id': 'react-tooltip',
                                'data-tooltip-html': `
                                    <div class="px-2 py-1">
                                        <div class="font-bold text-emerald-400 text-sm mb-1">${activity.count} Submissions</div>
                                        <div class="text-xs text-gray-400 font-mono">${format(parseISO(activity.date), 'EEE, MMM d')}</div>
                                    </div>
                                `
                            })
                        )}
                    />
                    <ReactTooltip 
                        id="react-tooltip" 
                        style={{ backgroundColor: "#09090b", border: "1px solid #3f3f46", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)" }} 
                    />
                </div>
            </motion.div>

            {/* Recent Submissions */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 0.4}} 
                className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" /> Recent Submissions
                    </h3>
                    <button className="text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors">View All</button>
                </div>

                <div className="w-full overflow-hidden rounded-xl border border-[#27272a]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#27272a]/50 text-xs uppercase text-gray-400 font-semibold border-b border-[#27272a]">
                                <th className="p-4">Status</th>
                                <th className="p-4">Problem</th>
                                <th className="p-4">Difficulty</th>
                                <th className="p-4 text-right">Language</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recent.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 text-sm italic">
                                        No recent activity found. Start solving!
                                    </td>
                                </tr>
                            ) : stats.recent.map((activity, idx) => (
                                <tr key={activity.id || idx} className="border-b border-[#27272a] last:border-0 hover:bg-[#27272a]/30 transition-colors">
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            activity.isAccepted ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                            {activity.isAccepted ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {activity.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-200">{activity.problem}</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">{activity.time}</div>
                                    </td>
                                    <td className="p-4">
                                         <span className={`text-xs px-2 py-0.5 rounded border ${
                                            activity.difficulty?.toLowerCase() === 'easy' ? 'border-emerald-500/30 text-emerald-500' :
                                            activity.difficulty?.toLowerCase() === 'medium' ? 'border-yellow-500/30 text-yellow-500' :
                                            'border-red-500/30 text-red-500'
                                         }`}>
                                            {activity.difficulty}
                                         </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="text-xs font-mono text-gray-400 bg-[#27272a] px-2 py-1 rounded">
                                            {activity.language}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;