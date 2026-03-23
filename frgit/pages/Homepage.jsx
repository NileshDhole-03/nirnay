// import { useEffect, useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { motion } from 'framer-motion';
// // Assuming axiosClient is correctly configured
// import axiosClient from '../utils/axiosClient'; 
// import { logoutUser } from '../authSlice';
// import { 
//   Code2, Filter, Sun, Moon, Menu, X, ArrowUp, ArrowDown, Search, 
//   Calendar, FolderOpen, Briefcase, BarChart3, Target, Zap, Flame 
// } from 'lucide-react';

// // --- Constants ---
// const DIFFICULTY_SCORES = {
//     'easy': 1,
//     'medium': 2,
//     'hard': 4,
// };

// // --- Helper Functions (Updated Palette) ---

// const getDifficultyColor = (difficulty, isDarkMode) => {
//   switch (difficulty?.toLowerCase()) {
//     // Changed Easy to Sky Blue to reduce "Green Overload"
//     case 'easy': return isDarkMode ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-sky-50 text-sky-700 border border-sky-200';
//     case 'medium': return isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200';
//     case 'hard': return isDarkMode ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200';
//     default: return isDarkMode ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' : 'bg-gray-100 text-gray-700 border border-gray-200';
//   }
// };

// const getTagColor = (tag, isDarkMode) => {
//   // Diverse colors for tags
//   const colors = [
//     isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700',
//     isDarkMode ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-violet-50 text-violet-700',
//     isDarkMode ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-pink-50 text-pink-700',
//     isDarkMode ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-50 text-cyan-700',
//     isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-700',
//   ];
//   // Hash string to pick a color deterministically
//   const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//   return colors[hash % colors.length];
// };

// const getSortIcon = (key, currentSort, isAscending) => {
//     if (key === currentSort) {
//         return isAscending ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
//     }
//     return <ArrowUp className="w-3.5 h-3.5 opacity-30" />;
// };

// // --- Main Component ---

// function Homepage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const [problems, setProblems] = useState([]);
//   const [solvedProblems, setSolvedProblems] = useState([]);
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [filters, setFilters] = useState({
//     difficulty: 'all',
//     tag: 'all',
//     status: 'all' 
//   });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState('id'); 
//   const [isAscending, setIsAscending] = useState(true);

//   // 1. Fetch Data 
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [problemsRes, solvedRes] = await Promise.all([
//             axiosClient.get('/problem/getAllProblem'),
//             user ? axiosClient.get('/problem/problemSolvedByUser') : Promise.resolve({ data: [] })
//         ]);
//         setProblems(problemsRes.data.map(p => ({ ...p, tags: p.tags || 'other' })));
//         setSolvedProblems(solvedRes.data);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };
//     fetchData();
//   }, [user]);

//   // 2. Theme Management
//   useEffect(() => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme) {
//       setIsDarkMode(savedTheme === 'dark');
//     }
//   }, []);

//   const toggleTheme = () => {
//     const newTheme = !isDarkMode;
//     setIsDarkMode(newTheme);
//     localStorage.setItem('theme', newTheme ? 'dark' : 'light');
//   };

//   const handleLogout = () => {
//     dispatch(logoutUser());
//     setSolvedProblems([]);
//     navigate('/');
//   };

//   const handleNavClick = (path) => {
//     setMobileMenuOpen(false);
//     navigate(path);
//   };

//   const handleSort = (key) => {
//       if (sortBy === key) {
//           setIsAscending(!isAscending);
//       } else {
//           setSortBy(key);
//           setIsAscending(true);
//       }
//   };

//   // --------------------------------------------------
//   // 3. DYNAMIC DATA CALCULATIONS
//   // --------------------------------------------------

//     const { uniqueTags, popularTopics, popularCompanies } = useMemo(() => {
//         const tagCounts = {};
//         problems.forEach(p => {
//             if (p.tags) {
//                 const normalizedTag = p.tags.toLowerCase().replace(/\s/g, '');
//                 tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
//             }
//         });

//         const calculatedUniqueTags = Object.keys(tagCounts);

//         const calculatedPopularTopics = Object.entries(tagCounts)
//             .sort(([, countA], [, countB]) => countB - countA)
//             .slice(0, 5) 
//             .map(([name, count]) => ({ 
//                 name: name.charAt(0).toUpperCase() + name.slice(1).replace('list', ' List').replace('dp', ' Dynamic Programming'), 
//                 count 
//             }));

//         const companyCounts = {};
//         problems.forEach((p) => {
//             if (p.company) {
//                 const companyName = p.company; 
//                 companyCounts[companyName] = (companyCounts[companyName] || 0) + 1;
//             }
//         });

//         const calculatedPopularCompanies = Object.entries(companyCounts)
//             .sort(([, countA], [, countB]) => countB - countA)
//             .slice(0, 6) 
//             .map(([name, count]) => ({ name, count }));

//         return { uniqueTags: calculatedUniqueTags, popularTopics: calculatedPopularTopics, popularCompanies: calculatedPopularCompanies };
//     }, [problems]);

//     // Progress Stats
//     const progressStats = useMemo(() => {
//         const total = problems.length;
//         const solved = solvedProblems.length;
//         const countByDiff = (arr, diff) => arr.filter(p => p.difficulty?.toLowerCase() === diff).length;

//         return {
//             total,
//             solved,
//             percentage: total === 0 ? 0 : Math.round((solved / total) * 100),
//             easy: { total: countByDiff(problems, 'easy'), solved: countByDiff(solvedProblems, 'easy') },
//             medium: { total: countByDiff(problems, 'medium'), solved: countByDiff(solvedProblems, 'medium') },
//             hard: { total: countByDiff(problems, 'hard'), solved: countByDiff(solvedProblems, 'hard') }
//         };
//     }, [problems, solvedProblems]);

//     // Activity Map & Streak
//     const { solvedScoresByDate, currentStreak } = useMemo(() => {
//         const scoresMap = new Map();
//         const dates = [];

//         solvedProblems.forEach(p => {
//             const date = new Date(p.solvedAt || p.updatedAt || new Date());
//             // Normalize date to midnight
//             date.setHours(0,0,0,0);
//             const dateStr = date.toDateString();

//             dates.push(date.getTime()); // Store timestamp for streak calc

//             const difficulty = p.difficulty ? p.difficulty.toLowerCase() : 'easy';
//             const score = DIFFICULTY_SCORES[difficulty] || 1; 
//             const currentScore = scoresMap.get(dateStr) || 0;
//             scoresMap.set(dateStr, currentScore + score);
//         });

//         // Calculate Streak
//         let streak = 0;
//         if (dates.length > 0) {
//             // Sort unique dates descending
//             const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
//             const today = new Date();
//             today.setHours(0,0,0,0);
//             const yesterday = new Date(today);
//             yesterday.setDate(yesterday.getDate() - 1);

//             // Check if streak is active (solved today or yesterday)
//             const lastSolved = new Date(uniqueDates[0]);
//             if (lastSolved.getTime() === today.getTime() || lastSolved.getTime() === yesterday.getTime()) {
//                 streak = 1;
//                 for (let i = 0; i < uniqueDates.length - 1; i++) {
//                     const curr = new Date(uniqueDates[i]);
//                     const prev = new Date(uniqueDates[i+1]);
//                     const diffTime = Math.abs(curr - prev);
//                     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
//                     if (diffDays === 1) {
//                         streak++;
//                     } else {
//                         break;
//                     }
//                 }
//             }
//         }

//         return { solvedScoresByDate: scoresMap, currentStreak: streak };
//     }, [solvedProblems]);

//     // Color Scale for Heatmap (Blue -> Indigo -> Emerald)
//     const getActivityLevelColor = (score, isDarkMode) => {
//         if (score === 0) return isDarkMode ? 'bg-[#27272a] text-zinc-600' : 'bg-gray-100 text-gray-300'; 
//         if (score < 3) return 'bg-sky-500/40 text-sky-200'; // Low activity - Sky Blue
//         if (score < 6) return 'bg-indigo-500/60 text-indigo-200'; // Medium - Indigo
//         return 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/50'; // High - Emerald
//     };

//     // Daily Challenge Logic (Deterministic random based on date)
//     const dailyChallenge = useMemo(() => {
//         if (problems.length === 0) return null;
//         const todayStr = new Date().toDateString();
//         let hash = 0;
//         for (let i = 0; i < todayStr.length; i++) hash = todayStr.charCodeAt(i) + ((hash << 5) - hash);
//         const index = Math.abs(hash) % problems.length;
//         return problems[index];
//     }, [problems]);


//   // 4. Filtering and Sorting Logic
//   const filteredProblems = useMemo(() => {
//     let list = problems.filter(problem => {
//       const searchMatch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
//       if (!searchMatch) return false;

//       const difficultyMatch = filters.difficulty === 'all' || problem.difficulty.toLowerCase() === filters.difficulty;
//       const problemTag = problem.tags ? problem.tags.toLowerCase().replace(/\s/g, '') : '';
//       const tagMatch = filters.tag === 'all' || problemTag === filters.tag;
//       const isSolved = solvedProblems.some(sp => sp._id === problem._id);
//       const statusMatch = filters.status === 'all' || (filters.status === 'solved' && isSolved) || (filters.status === 'unsolved' && !isSolved);

//       return difficultyMatch && tagMatch && statusMatch;
//     });

//     list.sort((a, b) => {
//         let aVal, bVal;
//         const problemAIndex = problems.findIndex(p => p._id === a._id);
//         const problemBIndex = problems.findIndex(p => p._id === b._id);
//         switch (sortBy) {
//             case 'id': aVal = problemAIndex; bVal = problemBIndex; break;
//             case 'acceptance': aVal = a.acceptance_rate || 0; bVal = b.acceptance_rate || 0; break;
//             case 'difficulty':
//                 const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
//                 aVal = difficultyOrder[a.difficulty.toLowerCase()] || 4;
//                 bVal = difficultyOrder[b.difficulty.toLowerCase()] || 4;
//                 break;
//             case 'frequency': aVal = a.frequency || 0; bVal = b.frequency || 0; break;
//             default: aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase();
//         }
//         if (aVal < bVal) return isAscending ? -1 : 1;
//         if (aVal > bVal) return isAscending ? 1 : -1;
//         return 0;
//     });
//     return list;
//   }, [problems, solvedProblems, filters, searchTerm, sortBy, isAscending]);

//   // 5. Styles
//   const bgClass = isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'; // Zinc-950
//   const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-gray-900';
//   const textSecondary = isDarkMode ? 'text-zinc-400' : 'text-gray-500';

//   // Updated Component Backgrounds (Zinc-900 for clearer definition)
//   const componentBg = isDarkMode ? 'bg-[#18181b]' : 'bg-white';
//   const componentBorder = isDarkMode ? 'border-zinc-800' : 'border-gray-200';

//   const inputClass = `w-full p-2.5 rounded-lg border ${componentBorder} ${isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'} ${textPrimary} focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none text-sm`;
//   const headerClass = `flex items-center gap-1.5 transition-colors hover:text-emerald-400 uppercase tracking-wider text-xs font-semibold py-3`;

//   // 6. Calendar Variables
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = today.getMonth();
//   const monthName = today.toLocaleDateString('en-US', { month: 'long' });
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const firstDayOfMonth = new Date(year, month, 1).getDay(); 
//   const solvedThisYear = Array.from(solvedScoresByDate.values()).filter(score => score > 0).length;

//   return (
//     <div className={`min-h-screen ${bgClass} font-sans`}>
//       <motion.nav
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-[#09090b]/80 border-b border-zinc-800' : 'bg-white/80 border-b border-gray-200'} backdrop-blur-md`}
//       >
//         <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
//             <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
//                 <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
//                     <Code2 className="w-5 h-5 text-white" strokeWidth={2.5} />
//                 </div>
//                 <span className={`text-xl font-bold tracking-tight ${textPrimary}`}>
//                     NIR<span className="text-emerald-400">NAY</span>
//                 </span>
//             </motion.div>

//             <div className="hidden lg:flex items-center gap-8">
//                 {[{ name: 'Home', path: '/' }, { name: 'Courses', path: '/courses' }, { name: 'Practice', path: '/Homepage' }, { name: 'DSA Visualizer', path: '/DSAVisualizer' }] 
//                     .map((item) => (
//                         <motion.button key={item.name} onClick={() => handleNavClick(item.path)} className={`${textSecondary} hover:text-emerald-400 transition-colors font-medium text-sm relative group ${item.name === 'Practice' ? 'text-emerald-400' : ''}`} whileHover={{ y: -1 }}>
//                             {item.name}
//                             <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-300 ${item.name === 'Practice' ? 'w-full' : ''}`} />
//                         </motion.button>
//                     ))}
//             </div>

//             <div className="hidden lg:flex items-center gap-4">
//                 <motion.button onClick={toggleTheme} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`p-2 rounded-lg ${componentBg} border ${componentBorder} hover:border-emerald-500/50 transition-all text-gray-400`}>
//                     {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
//                 </motion.button>

//                 {user ? (
//                     <div className="flex items-center gap-3">
//                         <div className={`flex items-center gap-3 ${componentBg} border ${componentBorder} rounded-lg px-3 py-1.5`}>
//                             <div className="w-7 h-7 rounded bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
//                                 {user.firstName?.[0]?.toUpperCase()}
//                             </div>
//                             <span className={`${textPrimary} text-sm font-medium`}>{user.firstName}</span>
//                         </div>
//                         {user.role === 'admin' && (<motion.button onClick={() => navigate('/admin')} whileHover={{ scale: 1.02 }} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-emerald-500/20">Admin</motion.button>)}
//                         <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} className={`px-4 py-2 ${componentBg} border ${componentBorder} rounded-lg text-sm font-medium hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400 transition-all ${textSecondary}`}>Logout</motion.button>
//                     </div>
//                 ) : (
//                     <>
//                         <motion.button onClick={() => navigate('/Login')} whileHover={{ scale: 1.02 }} className={`${textSecondary} hover:text-emerald-400 font-medium px-4 py-2 text-sm transition-colors`}>Login</motion.button>
//                         <motion.button onClick={() => navigate('/Signup')} whileHover={{ scale: 1.02 }} className="bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">Sign Up</motion.button>
//                     </>
//                 )}
//             </div>

//             <button className={`lg:hidden ${textPrimary}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
//                 {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//             </button>
//         </div>

//         {mobileMenuOpen && (
//             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`lg:hidden ${componentBg} border-t ${componentBorder} px-6 py-6 shadow-2xl`}>
//                 <div className="flex flex-col gap-4">
//                     {['Home', 'Practice', 'Courses', 'DSA Visualizer'].map((item) => (
//                         <button key={item} onClick={() => handleNavClick(`/${item === 'Home' ? '' : item.replace(' ', '')}`)} className={`text-left ${textPrimary} hover:text-emerald-400 transition-colors font-medium`}>
//                             {item}
//                         </button>
//                     ))}
//                     <button onClick={toggleTheme} className={`text-left ${textPrimary} hover:text-emerald-400 transition-colors font-medium flex items-center gap-2`}>
//                         {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//                         Toggle Theme
//                     </button>
//                     {user && (<button onClick={handleLogout} className="text-left text-red-400 hover:text-red-300 transition-colors font-medium">Logout</button>)}
//                 </div>
//             </motion.div>
//         )}
//       </motion.nav>

//       <div className="pt-24 px-6 lg:px-12 max-w-[1400px] mx-auto pb-10">
//         <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-8">

//             {/* LEFT COLUMN: Problems List */}
//             <div className="space-y-6">

//                 {/* Improved Filter Bar - High Contrast */}
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className={`${componentBg} border ${componentBorder} rounded-2xl p-6 shadow-sm`}
//                 >
//                     <div className="flex items-center gap-2 mb-5 text-emerald-500">
//                         <Filter className="w-4 h-4" />
//                         <h3 className="text-sm font-bold uppercase tracking-wider">Filters</h3>
//                     </div>
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
//                         <div>
//                             <label className={`text-xs font-semibold ${textSecondary} mb-2 block`}>Status</label>
//                             <select className={inputClass} value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
//                                 <option value="all">All Problems</option>
//                                 <option value="solved">Solved Only</option>
//                                 <option value="unsolved">Unsolved Only</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className={`text-xs font-semibold ${textSecondary} mb-2 block`}>Difficulty</label>
//                             <select className={inputClass} value={filters.difficulty} onChange={(e) => setFilters({...filters, difficulty: e.target.value})}>
//                                 <option value="all">All Levels</option>
//                                 <option value="easy">Easy</option>
//                                 <option value="medium">Medium</option>
//                                 <option value="hard">Hard</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className={`text-xs font-semibold ${textSecondary} mb-2 block`}>Topic</label>
//                             <select className={inputClass} value={filters.tag} onChange={(e) => setFilters({...filters, tag: e.target.value})}>
//                                 <option value="all">All Topics</option>
//                                 {uniqueTags.map(tag => (
//                                     <option key={tag} value={tag}>
//                                         {tag.toLowerCase() === 'dp' ? 'Dynamic Programming' : tag.charAt(0).toUpperCase() + tag.slice(1).replace('list', ' List')}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                 </motion.div>

//                 {/* Search & List */}
//                 <div className="space-y-4">
//                     <div className="relative group">
//                         <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${textSecondary} group-focus-within:text-emerald-500 transition-colors`} />
//                         <input
//                             type="text"
//                             placeholder="Search problems by title, number or tag..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className={`pl-10 pr-4 py-3.5 w-full rounded-xl border ${componentBorder} ${isDarkMode ? 'bg-[#18181b]' : 'bg-white'} ${textPrimary} focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none`}
//                         />
//                     </div>

//                     <div className={`${componentBg} border ${componentBorder} rounded-2xl overflow-hidden shadow-sm`}>
//                         <div className={`grid grid-cols-12 px-4 border-b ${componentBorder} ${textSecondary} hidden lg:grid ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
//                             <div className="col-span-1 pl-2 py-3 text-xs font-bold uppercase tracking-wider">Status</div>
//                             <div className="col-span-1 py-3"><button onClick={() => handleSort('id')} className={headerClass + (sortBy === 'id' ? ' text-emerald-500' : '')}># {getSortIcon('id', sortBy, isAscending)}</button></div>
//                             <div className="col-span-5 py-3"><button onClick={() => handleSort('title')} className={headerClass + (sortBy === 'title' ? ' text-emerald-500' : '')}>Title {getSortIcon('title', sortBy, isAscending)}</button></div>
//                             <div className="col-span-2 py-3"><button onClick={() => handleSort('acceptance')} className={headerClass + (sortBy === 'acceptance' ? ' text-emerald-500' : '')}>Acceptance {getSortIcon('acceptance', sortBy, isAscending)}</button></div>
//                             <div className="col-span-2 py-3"><button onClick={() => handleSort('difficulty')} className={headerClass + (sortBy === 'difficulty' ? ' text-emerald-500' : '')}>Difficulty {getSortIcon('difficulty', sortBy, isAscending)}</button></div>
//                             <div className="col-span-1 py-3"><button onClick={() => handleSort('frequency')} className={headerClass + (sortBy === 'frequency' ? ' text-emerald-500' : '')}>Freq {getSortIcon('frequency', sortBy, isAscending)}</button></div>
//                         </div>

//                         <div className="divide-y divide-gray-200 dark:divide-zinc-800">
//                             {filteredProblems.length === 0 ? (
//                                 <div className="p-12 text-center">
//                                     <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
//                                     <h3 className={`text-lg font-bold ${textPrimary} mb-1`}>No problems found</h3>
//                                     <p className={`text-sm ${textSecondary}`}>Adjust your filters to see more results.</p>
//                                 </div>
//                             ) : (
//                                 filteredProblems.map((problem, index) => {
//                                     const isSolved = solvedProblems.some(sp => sp._id === problem._id);
//                                     return (
//                                         <motion.div
//                                             key={problem._id}
//                                             initial={{ opacity: 0 }}
//                                             animate={{ opacity: 1 }}
//                                             transition={{ delay: index * 0.02 }}
//                                             className={`grid grid-cols-12 items-center py-4 px-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202023] group`}
//                                             onClick={() => navigate(`/problem/${problem._id}`)}
//                                         >
//                                             <div className="col-span-1 pl-2">
//                                                 {isSolved ? <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><Code2 className="w-3 h-3 text-emerald-500" /></div> : <div className="w-5 h-5 rounded-full border-2 border-zinc-700 group-hover:border-zinc-500" />}
//                                             </div>
//                                             <div className={`col-span-1 text-sm font-mono ${textSecondary}`}>{index + 1}</div>
//                                             <div className={`col-span-5 text-sm font-medium ${textPrimary} group-hover:text-emerald-400 transition-colors`}>{problem.title}</div>
//                                             <div className="col-span-2 text-sm text-emerald-500 font-mono">63.4%</div> 
//                                             <div className="col-span-2">
//                                                 <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-md tracking-wide ${getDifficultyColor(problem.difficulty, isDarkMode)}`}>
//                                                     {problem.difficulty}
//                                                 </span>
//                                             </div>
//                                             <div className="col-span-1 flex gap-0.5">
//                                                 <div className="w-1 h-3 bg-emerald-500 rounded-full opacity-80"/>
//                                                 <div className="w-1 h-3 bg-emerald-500 rounded-full opacity-60"/>
//                                                 <div className="w-1 h-3 bg-zinc-700 rounded-full"/>
//                                             </div>
//                                         </motion.div>
//                                     );
//                                 })
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* RIGHT COLUMN: Sidebar */}
//             <div className="lg:sticky lg:top-24 h-fit space-y-6">

//                 {/* --- 1. Daily Challenge (New) --- */}
//                 {dailyChallenge && (
//                     <motion.div
//                         initial={{ opacity: 0, x: 20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         className={`${componentBg} border ${componentBorder} rounded-2xl p-5 shadow-sm relative overflow-hidden group`}
//                         onClick={() => navigate(`/problem/${dailyChallenge._id}`)}
//                         style={{ cursor: 'pointer' }}
//                     >
//                         <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//                         <div className="flex justify-between items-start mb-3">
//                             <div className="flex items-center gap-2">
//                                 <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
//                                 <h3 className={`text-sm font-bold ${textPrimary} uppercase tracking-wider`}>Daily Challenge</h3>
//                             </div>
//                             <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{new Date().toLocaleDateString()}</span>
//                         </div>
//                         <h4 className={`text-md font-semibold ${textPrimary} mb-1 group-hover:text-emerald-400 transition-colors`}>{dailyChallenge.title}</h4>
//                         <div className="flex items-center gap-2 text-xs">
//                             <span className={`px-2 py-0.5 rounded ${getDifficultyColor(dailyChallenge.difficulty, isDarkMode)}`}>{dailyChallenge.difficulty}</span>
//                             <span className={textSecondary}>+10 Points</span>
//                         </div>
//                     </motion.div>
//                 )}

//                 {/* --- 2. Progress Widget --- */}
//                 {user && (
//                     <motion.div
//                         initial={{ opacity: 0, x: 20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.1 }}
//                         className={`${componentBg} border ${componentBorder} rounded-2xl p-5 shadow-sm`}
//                     >
//                         <h3 className={`text-sm font-bold ${textPrimary} flex items-center gap-2 mb-4 uppercase tracking-wider`}>
//                             <Target className="w-4 h-4 text-emerald-500" /> Progress
//                         </h3>

//                         <div className="flex items-center justify-between mb-4">
//                             <div>
//                                 <span className={`text-3xl font-bold ${textPrimary}`}>{progressStats.solved}</span>
//                                 <span className={`text-xs ${textSecondary} ml-1`}>/ {progressStats.total} Solved</span>
//                             </div>
//                             <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
//                                 <span className="text-xs font-bold text-emerald-500">{progressStats.percentage}%</span>
//                                 <svg className="absolute inset-0 w-full h-full -rotate-90">
//                                     <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-emerald-500" strokeDasharray="113" strokeDashoffset={113 - (113 * progressStats.percentage) / 100} strokeLinecap="round" />
//                                 </svg>
//                             </div>
//                         </div>

//                         <div className="space-y-3">
//                             <div className="space-y-1">
//                                 <div className="flex justify-between text-xs">
//                                     <span className="text-sky-400 font-medium">Easy</span>
//                                     <span className={textSecondary}>{progressStats.easy.solved}/{progressStats.easy.total}</span>
//                                 </div>
//                                 <div className="h-1.5 w-full bg-zinc-700/30 rounded-full overflow-hidden">
//                                     <motion.div initial={{ width: 0 }} animate={{ width: `${(progressStats.easy.solved / (progressStats.easy.total || 1)) * 100}%` }} className="h-full bg-sky-500 rounded-full" />
//                                 </div>
//                             </div>
//                             <div className="space-y-1">
//                                 <div className="flex justify-between text-xs">
//                                     <span className="text-amber-400 font-medium">Medium</span>
//                                     <span className={textSecondary}>{progressStats.medium.solved}/{progressStats.medium.total}</span>
//                                 </div>
//                                 <div className="h-1.5 w-full bg-zinc-700/30 rounded-full overflow-hidden">
//                                     <motion.div initial={{ width: 0 }} animate={{ width: `${(progressStats.medium.solved / (progressStats.medium.total || 1)) * 100}%` }} className="h-full bg-amber-500 rounded-full" />
//                                 </div>
//                             </div>
//                             <div className="space-y-1">
//                                 <div className="flex justify-between text-xs">
//                                     <span className="text-rose-400 font-medium">Hard</span>
//                                     <span className={textSecondary}>{progressStats.hard.solved}/{progressStats.hard.total}</span>
//                                 </div>
//                                 <div className="h-1.5 w-full bg-zinc-700/30 rounded-full overflow-hidden">
//                                     <motion.div initial={{ width: 0 }} animate={{ width: `${(progressStats.hard.solved / (progressStats.hard.total || 1)) * 100}%` }} className="h-full bg-rose-500 rounded-full" />
//                                 </div>
//                             </div>
//                         </div>
//                     </motion.div>
//                 )}

//                 {/* --- 3. Activity Calendar (Enhanced) --- */}
//                 <motion.div
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.2 }}
//                     className={`${componentBg} border ${componentBorder} rounded-2xl p-5 shadow-sm`}
//                 >
//                     <div className="flex justify-between items-center mb-4">
//                         <h3 className={`text-sm font-bold ${textPrimary} flex items-center gap-2 uppercase tracking-wider`}>
//                             <Calendar className="w-4 h-4 text-violet-500" /> Activity
//                         </h3>
//                         {user && <span className="text-xs bg-flame-500/10 text-orange-400 font-mono px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1"><Flame size={10} /> {useMemo(() => {
//                             // Quick streak calc re-use
//                             // (Normally would extract to helper)
//                             return 0; // Placeholder for visual
//                         }, [])} Day Streak</span>}
//                     </div>

//                     <div className={`flex items-center justify-between text-sm font-medium ${textPrimary} mb-2`}>
//                         <span>{monthName} {year}</span>
//                         <span className="text-xs text-emerald-500">{solvedThisYear} active days</span>
//                     </div>

//                     <div className="grid grid-cols-7 gap-1.5 mb-3">
//                         {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-center text-[10px] text-zinc-500 font-bold">{d}</span>)}
//                         {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`pad-${i}`} />)} 
//                         {Array(daysInMonth).fill().map((_, i) => {
//                             const dateStr = new Date(year, month, i + 1).toDateString();
//                             const score = solvedScoresByDate.get(dateStr) || 0;
//                             const isToday = dateStr === today.toDateString();
//                             return (
//                                 <div 
//                                     key={i} 
//                                     className={`aspect-square rounded-md ${getActivityLevelColor(score, isDarkMode)} ${isToday ? 'ring-1 ring-white' : ''} transition-all hover:scale-110 cursor-help`} 
//                                     title={`${new Date(year, month, i+1).toLocaleDateString()}: ${score} points`}
//                                 />
//                             );
//                         })}
//                     </div>
//                 </motion.div>

//                 {/* Popular Topics (Re-styled) */}
//                 <motion.div
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.3 }}
//                     className={`${componentBg} border ${componentBorder} rounded-2xl p-5 shadow-sm`}
//                 >
//                     <h3 className={`text-sm font-bold ${textPrimary} flex items-center gap-2 mb-4 uppercase tracking-wider`}>
//                         <FolderOpen className="w-4 h-4 text-emerald-500" /> Popular Topics
//                     </h3>
//                     <div className="flex flex-wrap gap-2">
//                         {popularTopics.map(topic => (
//                             <button 
//                                 key={topic.name} 
//                                 className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all hover:scale-105 ${getTagColor(topic.name, isDarkMode)}`}
//                                 onClick={() => setFilters({...filters, tag: topic.name.toLowerCase().replace(/\s/g, '')})}
//                             >
//                                 {topic.name}
//                             </button>
//                         ))}
//                     </div>
//                 </motion.div>

//             </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Homepage;

// import { useEffect, useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { motion } from 'framer-motion';
// // Assuming axiosClient is correctly configured
// import axiosClient from '../utils/axiosClient'; 
// import { logoutUser } from '../authSlice';
// import { 
//   Code2, Filter, Sun, Moon, Menu, X, ArrowUp, ArrowDown, Search, 
//   Calendar, FolderOpen, Briefcase, BarChart3, Target, Zap, Flame 
// } from 'lucide-react';

// // --- Constants ---
// const DIFFICULTY_SCORES = {
//     'easy': 1,
//     'medium': 2,
//     'hard': 4,
// };

// // --- Helper Functions (Updated Palette) ---

// const getDifficultyColor = (difficulty, isDarkMode) => {
//   switch (difficulty?.toLowerCase()) {
//     // Changed Easy to Sky Blue to reduce "Green Overload"
//     case 'easy': return isDarkMode ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-sky-50 text-sky-700 border border-sky-200';
//     case 'medium': return isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200';
//     case 'hard': return isDarkMode ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200';
//     default: return isDarkMode ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' : 'bg-gray-100 text-gray-700 border border-gray-200';
//   }
// };

// const getTagColor = (tag, isDarkMode) => {
//   // Diverse colors for tags
//   const colors = [
//     isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700',
//     isDarkMode ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-violet-50 text-violet-700',
//     isDarkMode ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-pink-50 text-pink-700',
//     isDarkMode ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-50 text-cyan-700',
//     isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-700',
//   ];
//   // Hash string to pick a color deterministically
//   const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//   return colors[hash % colors.length];
// };

// const getSortIcon = (key, currentSort, isAscending) => {
//     if (key === currentSort) {
//         return isAscending ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
//     }
//     return <ArrowUp className="w-3.5 h-3.5 opacity-30" />;
// };

// // --- Main Component ---

// function Homepage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const [problems, setProblems] = useState([]);
//   const [solvedProblems, setSolvedProblems] = useState([]);
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [filters, setFilters] = useState({
//     difficulty: 'all',
//     tag: 'all',
//     status: 'all' 
//   });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState('id'); 
//   const [isAscending, setIsAscending] = useState(true);

//   // 1. Fetch Data 
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [problemsRes, solvedRes] = await Promise.all([
//             axiosClient.get('/problem/getAllProblem'),
//             user ? axiosClient.get('/problem/problemSolvedByUser') : Promise.resolve({ data: [] })
//         ]);
//         setProblems(problemsRes.data.map(p => ({ ...p, tags: p.tags || 'other' })));
//         setSolvedProblems(solvedRes.data);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };
//     fetchData();
//   }, [user]);

//   // 2. Theme Management
//   useEffect(() => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme) {
//       setIsDarkMode(savedTheme === 'dark');
//     }
//   }, []);

//   const toggleTheme = () => {
//     const newTheme = !isDarkMode;
//     setIsDarkMode(newTheme);
//     localStorage.setItem('theme', newTheme ? 'dark' : 'light');
//   };

//   const handleLogout = () => {
//     dispatch(logoutUser());
//     setSolvedProblems([]);
//     navigate('/');
//   };

//   const handleNavClick = (path) => {
//     setMobileMenuOpen(false);
//     navigate(path);
//   };

//   const handleSort = (key) => {
//       if (sortBy === key) {
//           setIsAscending(!isAscending);
//       } else {
//           setSortBy(key);
//           setIsAscending(true);
//       }
//   };

//   // --------------------------------------------------
//   // 3. DYNAMIC DATA CALCULATIONS
//   // --------------------------------------------------

//     const { uniqueTags, popularTopics, popularCompanies } = useMemo(() => {
//         const tagCounts = {};
//         problems.forEach(p => {
//             if (p.tags) {
//                 const normalizedTag = p.tags.toLowerCase().replace(/\s/g, '');
//                 tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
//             }
//         });

//         const calculatedUniqueTags = Object.keys(tagCounts);

//         const calculatedPopularTopics = Object.entries(tagCounts)
//             .sort(([, countA], [, countB]) => countB - countA)
//             .slice(0, 5) 
//             .map(([name, count]) => ({ 
//                 name: name.charAt(0).toUpperCase() + name.slice(1).replace('list', ' List').replace('dp', ' Dynamic Programming'), 
//                 count 
//             }));

//         const companyCounts = {};
//         problems.forEach((p) => {
//             if (p.company) {
//                 const companyName = p.company; 
//                 companyCounts[companyName] = (companyCounts[companyName] || 0) + 1;
//             }
//         });

//         const calculatedPopularCompanies = Object.entries(companyCounts)
//             .sort(([, countA], [, countB]) => countB - countA)
//             .slice(0, 6) 
//             .map(([name, count]) => ({ name, count }));

//         return { uniqueTags: calculatedUniqueTags, popularTopics: calculatedPopularTopics, popularCompanies: calculatedPopularCompanies };
//     }, [problems]);

//     // Progress Stats
//     const progressStats = useMemo(() => {
//         const total = problems.length;
//         const solved = solvedProblems.length;
//         const countByDiff = (arr, diff) => arr.filter(p => p.difficulty?.toLowerCase() === diff).length;

//         return {
//             total,
//             solved,
//             percentage: total === 0 ? 0 : Math.round((solved / total) * 100),
//             easy: { total: countByDiff(problems, 'easy'), solved: countByDiff(solvedProblems, 'easy') },
//             medium: { total: countByDiff(problems, 'medium'), solved: countByDiff(solvedProblems, 'medium') },
//             hard: { total: countByDiff(problems, 'hard'), solved: countByDiff(solvedProblems, 'hard') }
//         };
//     }, [problems, solvedProblems]);

//     // Activity Map & Streak
//     const { solvedScoresByDate, currentStreak } = useMemo(() => {
//         const scoresMap = new Map();
//         const dates = [];

//         solvedProblems.forEach(p => {
//             const date = new Date(p.solvedAt || p.updatedAt || new Date());
//             // Normalize date to midnight
//             date.setHours(0,0,0,0);
//             const dateStr = date.toDateString();

//             dates.push(date.getTime()); // Store timestamp for streak calc

//             const difficulty = p.difficulty ? p.difficulty.toLowerCase() : 'easy';
//             const score = DIFFICULTY_SCORES[difficulty] || 1; 
//             const currentScore = scoresMap.get(dateStr) || 0;
//             scoresMap.set(dateStr, currentScore + score);
//         });

//         // Calculate Streak
//         let streak = 0;
//         if (dates.length > 0) {
//             // Sort unique dates descending
//             const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
//             const today = new Date();
//             today.setHours(0,0,0,0);
//             const yesterday = new Date(today);
//             yesterday.setDate(yesterday.getDate() - 1);

//             // Check if streak is active (solved today or yesterday)
//             const lastSolved = new Date(uniqueDates[0]);
//             if (lastSolved.getTime() === today.getTime() || lastSolved.getTime() === yesterday.getTime()) {
//                 streak = 1;
//                 for (let i = 0; i < uniqueDates.length - 1; i++) {
//                     const curr = new Date(uniqueDates[i]);
//                     const prev = new Date(uniqueDates[i+1]);
//                     const diffTime = Math.abs(curr - prev);
//                     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
//                     if (diffDays === 1) {
//                         streak++;
//                     } else {
//                         break;
//                     }
//                 }
//             }
//         }

//         return { solvedScoresByDate: scoresMap, currentStreak: streak };
//     }, [solvedProblems]);

//     // Color Scale for Heatmap (Blue -> Indigo -> Emerald)
//     const getActivityLevelColor = (score, isDarkMode) => {
//         if (score === 0) return isDarkMode ? 'bg-[#27272a] text-zinc-600' : 'bg-gray-100 text-gray-300'; 
//         if (score < 3) return 'bg-sky-500/40 text-sky-200'; // Low activity - Sky Blue
//         if (score < 6) return 'bg-indigo-500/60 text-indigo-200'; // Medium - Indigo
//         return 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/50'; // High - Emerald
//     };

//     // Daily Challenge Logic (Deterministic random based on date)
//     const dailyChallenge = useMemo(() => {
//         if (problems.length === 0) return null;
//         const todayStr = new Date().toDateString();
//         let hash = 0;
//         for (let i = 0; i < todayStr.length; i++) hash = todayStr.charCodeAt(i) + ((hash << 5) - hash);
//         const index = Math.abs(hash) % problems.length;
//         return problems[index];
//     }, [problems]);


//   // 4. Filtering and Sorting Logic
//   const filteredProblems = useMemo(() => {
//     let list = problems.filter(problem => {
//       const searchMatch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
//       if (!searchMatch) return false;

//       const difficultyMatch = filters.difficulty === 'all' || problem.difficulty.toLowerCase() === filters.difficulty;
//       const problemTag = problem.tags ? problem.tags.toLowerCase().replace(/\s/g, '') : '';
//       const tagMatch = filters.tag === 'all' || problemTag === filters.tag;
//       const isSolved = solvedProblems.some(sp => sp._id === problem._id);
//       const statusMatch = filters.status === 'all' || (filters.status === 'solved' && isSolved) || (filters.status === 'unsolved' && !isSolved);

//       return difficultyMatch && tagMatch && statusMatch;
//     });

//     list.sort((a, b) => {
//         let aVal, bVal;
//         const problemAIndex = problems.findIndex(p => p._id === a._id);
//         const problemBIndex = problems.findIndex(p => p._id === b._id);
//         switch (sortBy) {
//             case 'id': aVal = problemAIndex; bVal = problemBIndex; break;
//             case 'acceptance': aVal = a.acceptance_rate || 0; bVal = b.acceptance_rate || 0; break;
//             case 'difficulty':
//                 const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
//                 aVal = difficultyOrder[a.difficulty.toLowerCase()] || 4;
//                 bVal = difficultyOrder[b.difficulty.toLowerCase()] || 4;
//                 break;
//             case 'frequency': aVal = a.frequency || 0; bVal = b.frequency || 0; break;
//             default: aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase();
//         }
//         if (aVal < bVal) return isAscending ? -1 : 1;
//         if (aVal > bVal) return isAscending ? 1 : -1;
//         return 0;
//     });
//     return list;
//   }, [problems, solvedProblems, filters, searchTerm, sortBy, isAscending]);

//   // 5. Styles
//   const bgClass = isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'; // Zinc-950
//   const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-gray-900';
//   const textSecondary = isDarkMode ? 'text-zinc-400' : 'text-gray-500';

//   // Updated Component Backgrounds (Zinc-900 for clearer definition)
//   const componentBg = isDarkMode ? 'bg-[#18181b]' : 'bg-white';
//   const componentBorder = isDarkMode ? 'border-zinc-800' : 'border-gray-200';

//   const inputClass = `w-full p-2.5 rounded-lg border ${componentBorder} ${isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'} ${textPrimary} focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none text-sm`;
//   const headerClass = `flex items-center gap-1.5 transition-colors hover:text-emerald-400 uppercase tracking-wider text-xs font-semibold py-3`;

//   // 6. Calendar Variables
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = today.getMonth();
//   const monthName = today.toLocaleDateString('en-US', { month: 'long' });
//   const daysInMonth = new Date(year, month + 1, 0).getDate();
//   const firstDayOfMonth = new Date(year, month, 1).getDay(); 
//   const solvedThisYear = Array.from(solvedScoresByDate.values()).filter(score => score > 0).length;

//   return (
//     <div className={`min-h-screen ${bgClass} font-sans`}>
//       <motion.nav
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-[#09090b]/80 border-b border-zinc-800' : 'bg-white/80 border-b border-gray-200'} backdrop-blur-md`}
//       >
//         <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
//             <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
//                 <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
//                     <Code2 className="w-5 h-5 text-white" strokeWidth={2.5} />
//                 </div>
//                 <span className={`text-xl font-bold tracking-tight ${textPrimary}`}>
//                     NIR<span className="text-emerald-400">NAY</span>
//                 </span>
//             </motion.div>

//             <div className="hidden lg:flex items-center gap-8">
//                 {[{ name: 'Home', path: '/' }, { name: 'Courses', path: '/courses' }, { name: 'Practice', path: '/Homepage' }, { name: 'DSA Visualizer', path: '/DSAVisualizer' }] 
//                     .map((item) => (
//                         <motion.button key={item.name} onClick={() => handleNavClick(item.path)} className={`${textSecondary} hover:text-emerald-400 transition-colors font-medium text-sm relative group ${item.name === 'Practice' ? 'text-emerald-400' : ''}`} whileHover={{ y: -1 }}>
//                             {item.name}
//                             <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-300 ${item.name === 'Practice' ? 'w-full' : ''}`} />
//                         </motion.button>
//                     ))}
//             </div>

//             <div className="hidden lg:flex items-center gap-4">
//                 <motion.button onClick={toggleTheme} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`p-2 rounded-lg ${componentBg} border ${componentBorder} hover:border-emerald-500/50 transition-all text-gray-400`}>
//                     {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
//                 </motion.button>

//                 {user ? (
//                     <div className="flex items-center gap-3">
//                         <div className={`flex items-center gap-3 ${componentBg} border ${componentBorder} rounded-lg px-3 py-1.5`}>
//                             <div className="w-7 h-7 rounded bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
//                                 {user.firstName?.[0]?.toUpperCase()}
//                             </div>
//                             <span className={`${textPrimary} text-sm font-medium`}>{user.firstName}</span>
//                         </div>
//                         {user.role === 'admin' && (<motion.button onClick={() => navigate('/admin')} whileHover={{ scale: 1.02 }} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-emerald-500/20">Admin</motion.button>)}
//                         <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} className={`px-4 py-2 ${componentBg} border ${componentBorder} rounded-lg text-sm font-medium hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-400 transition-all ${textSecondary}`}>Logout</motion.button>
//                     </div>
//                 ) : (
//                     <>
//                         <motion.button onClick={() => navigate('/Login')} whileHover={{ scale: 1.02 }} className={`${textSecondary} hover:text-emerald-400 font-medium px-4 py-2 text-sm transition-colors`}>Login</motion.button>
//                         <motion.button onClick={() => navigate('/Signup')} whileHover={{ scale: 1.02 }} className="bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">Sign Up</motion.button>
//                     </>
//                 )}
//             </div>

//             <button className={`lg:hidden ${textPrimary}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
//                 {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//             </button>
//         </div>

//         {mobileMenuOpen && (
//             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`lg:hidden ${componentBg} border-t ${componentBorder} px-6 py-6 shadow-2xl`}>
//                 <div className="flex flex-col gap-4">
//                     {['Home', 'Practice', 'Courses', 'DSA Visualizer'].map((item) => (
//                         <button key={item} onClick={() => handleNavClick(`/${item === 'Home' ? '' : item.replace(' ', '')}`)} className={`text-left ${textPrimary} hover:text-emerald-400 transition-colors font-medium`}>
//                             {item}
//                         </button>
//                     ))}
//                     <button onClick={toggleTheme} className={`text-left ${textPrimary} hover:text-emerald-400 transition-colors font-medium flex items-center gap-2`}>
//                         {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//                         Toggle Theme
//                     </button>
//                     {user && (<button onClick={handleLogout} className="text-left text-red-400 hover:text-red-300 transition-colors font-medium">Logout</button>)}
//                 </div>
//             </motion.div>
//         )}
//       </motion.nav>

//       <div className="pt-24 px-6 lg:px-12 max-w-[1400px] mx-auto pb-10">
//         <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-8">

//             {/* LEFT COLUMN: Problems List */}
//             <div className="space-y-6">

//                 {/* Improved Filter Bar - High Contrast */}
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className={`${componentBg} border ${componentBorder} rounded-2xl p-6 shadow-sm`}
//                 >
//                     <div className="flex items-center gap-2 mb-5 text-emerald-500">
//                         <Filter className="w-4 h-4" />
//                         <h3 className="text-sm font-bold uppercase tracking-wider">Filters</h3>
//                     </div>
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
//                         <div>
//                             <label className={`text-xs font-semibold ${textSecondary} mb-2 block`}>Status</label>
//                             <select className={inputClass} value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
//                                 <option value="all">All Problems</option>
//                                 <option value="solved">Solved Only</option>
//                                 <option value="unsolved">Unsolved Only</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className={`text-xs font-semibold ${textSecondary} mb-2 block`}>Difficulty</label>
//                             <select className={inputClass} value={filters.difficulty} onChange={(e) => setFilters({...filters, difficulty: e.target.value})}>
//                                 <option value="all">All Levels</option>
//                                 <option value="easy">Easy</option>
//                                 <option value="medium">Medium</option>
//                                 <option value="hard">Hard</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className={`text-xs font-semibold ${textSecondary} mb-2 block`}>Topic</label>
//                             <select className={inputClass} value={filters.tag} onChange={(e) => setFilters({...filters, tag: e.target.value})}>
//                                 <option value="all">All Topics</option>
//                                 {uniqueTags.map(tag => (
//                                     <option key={tag} value={tag}>
//                                         {tag.toLowerCase() === 'dp' ? 'Dynamic Programming' : tag.charAt(0).toUpperCase() + tag.slice(1).replace('list', ' List')}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                 </motion.div>

//                 {/* Search & List */}
//                 <div className="space-y-4">
//                     <div className="relative group">
//                         <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${textSecondary} group-focus-within:text-emerald-500 transition-colors`} />
//                         <input
//                             type="text"
//                             placeholder="Search problems by title, number or tag..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className={`pl-10 pr-4 py-3.5 w-full rounded-xl border ${componentBorder} ${isDarkMode ? 'bg-[#18181b]' : 'bg-white'} ${textPrimary} focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none`}
//                         />
//                     </div>

//                     <div className={`${componentBg} border ${componentBorder} rounded-2xl overflow-hidden shadow-sm`}>
//                         <div className={`grid grid-cols-12 px-4 border-b ${componentBorder} ${textSecondary} hidden lg:grid ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
//                             <div className="col-span-1 pl-2 py-3 text-xs font-bold uppercase tracking-wider">Status</div>
//                             <div className="col-span-1 py-3"><button onClick={() => handleSort('id')} className={headerClass + (sortBy === 'id' ? ' text-emerald-500' : '')}># {getSortIcon('id', sortBy, isAscending)}</button></div>
//                             <div className="col-span-5 py-3"><button onClick={() => handleSort('title')} className={headerClass + (sortBy === 'title' ? ' text-emerald-500' : '')}>Title {getSortIcon('title', sortBy, isAscending)}</button></div>
//                             <div className="col-span-2 py-3"><button onClick={() => handleSort('acceptance')} className={headerClass + (sortBy === 'acceptance' ? ' text-emerald-500' : '')}>Acceptance {getSortIcon('acceptance', sortBy, isAscending)}</button></div>
//                             <div className="col-span-2 py-3"><button onClick={() => handleSort('difficulty')} className={headerClass + (sortBy === 'difficulty' ? ' text-emerald-500' : '')}>Difficulty {getSortIcon('difficulty', sortBy, isAscending)}</button></div>
//                             <div className="col-span-1 py-3"><button onClick={() => handleSort('frequency')} className={headerClass + (sortBy === 'frequency' ? ' text-emerald-500' : '')}>Freq {getSortIcon('frequency', sortBy, isAscending)}</button></div>
//                         </div>

//                         <div className="divide-y divide-gray-200 dark:divide-zinc-800">
//                             {filteredProblems.length === 0 ? (
//                                 <div className="p-12 text-center">
//                                     <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
//                                     <h3 className={`text-lg font-bold ${textPrimary} mb-1`}>No problems found</h3>
//                                     <p className={`text-sm ${textSecondary}`}>Adjust your filters to see more results.</p>
//                                 </div>
//                             ) : (
//                                 filteredProblems.map((problem, index) => {
//                                     const isSolved = solvedProblems.some(sp => sp._id === problem._id);
//                                     return (
//                                         <motion.div
//                                             key={problem._id}
//                                             initial={{ opacity: 0 }}
//                                             animate={{ opacity: 1 }}
//                                             transition={{ delay: index * 0.02 }}
//                                             className={`grid grid-cols-12 items-center py-4 px-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202023] group`}
//                                             onClick={() => navigate(`/problem/${problem._id}`)}
//                                         >
//                                             <div className="col-span-1 pl-2">
//                                                 {isSolved ? <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><Code2 className="w-3 h-3 text-emerald-500" /></div> : <div className="w-5 h-5 rounded-full border-2 border-zinc-700 group-hover:border-zinc-500" />}
//                                             </div>
//                                             <div className={`col-span-1 text-sm font-mono ${textSecondary}`}>{index + 1}</div>
//                                             <div className={`col-span-5 text-sm font-medium ${textPrimary} group-hover:text-emerald-400 transition-colors`}>{problem.title}</div>
//                                             <div className="col-span-2 text-sm text-emerald-500 font-mono">63.4%</div> 
//                                             <div className="col-span-2">
//                                                 <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-md tracking-wide ${getDifficultyColor(problem.difficulty, isDarkMode)}`}>
//                                                     {problem.difficulty}
//                                                 </span>
//                                             </div>
//                                             <div className="col-span-1 flex gap-0.5">
//                                                 <div className="w-1 h-3 bg-emerald-500 rounded-full opacity-80"/>
//                                                 <div className="w-1 h-3 bg-emerald-500 rounded-full opacity-60"/>
//                                                 <div className="w-1 h-3 bg-zinc-700 rounded-full"/>
//                                             </div>
//                                         </motion.div>
//                                     );
//                                 })
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* RIGHT COLUMN: Sidebar */}
//             <div className="lg:sticky lg:top-24 h-fit space-y-6">

//                 {/* --- 1. Daily Challenge (New) --- */}
//                 {dailyChallenge && (
//                     <motion.div
//                         initial={{ opacity: 0, x: 20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         className={`${componentBg} border ${componentBorder} rounded-2xl p-5 shadow-sm relative overflow-hidden group`}
//                         onClick={() => navigate(`/problem/${dailyChallenge._id}`)}
//                         style={{ cursor: 'pointer' }}
//                     >
//                         <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//                         <div className="flex justify-between items-start mb-3">
//                             <div className="flex items-center gap-2">
//                                 <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
//                                 <h3 className={`text-sm font-bold ${textPrimary} uppercase tracking-wider`}>Daily Challenge</h3>
//                             </div>
//                             <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{new Date().toLocaleDateString()}</span>
//                         </div>
//                         <h4 className={`text-md font-semibold ${textPrimary} mb-1 group-hover:text-emerald-400 transition-colors`}>{dailyChallenge.title}</h4>
//                         <div className="flex items-center gap-2 text-xs">
//                             <span className={`px-2 py-0.5 rounded ${getDifficultyColor(dailyChallenge.difficulty, isDarkMode)}`}>{dailyChallenge.difficulty}</span>
//                             <span className={textSecondary}>+10 Points</span>
//                         </div>
//                     </motion.div>
//                 )}

//                 {/* --- 2. Progress Widget --- */}
//                 {user && (
//                     <motion.div
//                         initial={{ opacity: 0, x: 20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.1 }}
//                         className={`${componentBg} border ${componentBorder} rounded-2xl p-5 shadow-sm`}
//                     >
//                         <h3 className={`text-sm font-bold ${textPrimary} flex items-center gap-2 mb-4 uppercase tracking-wider`}>
//                             <Target className="w-4 h-4 text-emerald-500" /> Progress
//                         </h3>

//                         <div className="flex items-center justify-between mb-4">
//                             <div>
//                                 <span className={`text-3xl font-bold ${textPrimary}`}>{progressStats.solved}</span>
//                                 <span className={`text-xs ${textSecondary} ml-1`}>/ {progressStats.total} Solved</span>
//                             </div>
//                             <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
//                                 <span className="text-xs font-bold text-emerald-500">{progressStats.percentage}%</span>
//                                 <svg className="absolute inset-0 w-full h-full -rotate-90">
//                                     <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-emerald-500" strokeDasharray="113" strokeDashoffset={113 - (113 * progressStats.percentage) / 100} strokeLinecap="round" />
//                                 </svg>
//                             </div>
//                         </div>

//                         <div className="space-y-3">
//                             <div className="space-y-1">
//                                 <div className="flex justify-between text-xs">
//                                     <span className="text-sky-400 font-medium">Easy</span>
//                                     <span className={textSecondary}>{progressStats.easy.solved}/{progressStats.easy.total}</span>
//                                 </div>
//                                 <div className="h-1.5 w-full bg-zinc-700/30 rounded-full overflow-hidden">
//                                     <motion.div initial={{ width: 0 }} animate={{ width: `${(progressStats.easy.solved / (progressStats.easy.total || 1)) * 100}%` }} className="h-full bg-sky-500 rounded-full" />
//                                 </div>
//                             </div>
//                             <div className="space-y-1">
//                                 <div className="flex justify-between text-xs">
//                                     <span className="text-amber-400 font-medium">Medium</span>
//                                     <span className={textSecondary}>{progressStats.medium.solved}/{progressStats.medium.total}</span>
//                                 </div>
//                                 <div className="h-1.5 w-full bg-zinc-700/30 rounded-full overflow-hidden">
//                                     <motion.div initial={{ width: 0 }} animate={{ width: `${(progressStats.medium.solved / (progressStats.medium.total || 1)) * 100}%` }} className="h-full bg-amber-500 rounded-full" />
//                                 </div>
//                             </div>
//                             <div className="space-y-1">
//                                 <div className="flex justify-between text-xs">
//                                     <span className="text-rose-400 font-medium">Hard</span>
//                                     <span className={textSecondary}>{progressStats.hard.solved}/{progressStats.hard.total}</span>
//                                 </div>
//                                 <div className="h-1.5 w-full bg-zinc-700/30 rounded-full overflow-hidden">
//                                     <motion.div initial={{ width: 0 }} animate={{ width: `${(progressStats.hard.solved / (progressStats.hard.total || 1)) * 100}%` }} className="h-full bg-rose-500 rounded-full" />
//                                 </div>
//                             </div>
//                         </div>
//                     </motion.div>
//                 )}

//                 {/* --- 3. Activity Calendar (Enhanced) --- */}
//                 <motion.div
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.2 }}
//                     className={`${componentBg} border ${componentBorder} rounded-2xl p-5 shadow-sm`}
//                 >
//                     <div className="flex justify-between items-center mb-4">
//                         <h3 className={`text-sm font-bold ${textPrimary} flex items-center gap-2 uppercase tracking-wider`}>
//                             <Calendar className="w-4 h-4 text-violet-500" /> Activity
//                         </h3>
//                         {user && <span className="text-xs bg-flame-500/10 text-orange-400 font-mono px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1"><Flame size={10} /> {useMemo(() => {
//                             // Quick streak calc re-use
//                             // (Normally would extract to helper)
//                             return 0; // Placeholder for visual
//                         }, [])} Day Streak</span>}
//                     </div>

//                     <div className={`flex items-center justify-between text-sm font-medium ${textPrimary} mb-2`}>
//                         <span>{monthName} {year}</span>
//                         <span className="text-xs text-emerald-500">{solvedThisYear} active days</span>
//                     </div>

//                     <div className="grid grid-cols-7 gap-1.5 mb-3">
//                         {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-center text-[10px] text-zinc-500 font-bold">{d}</span>)}
//                         {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`pad-${i}`} />)} 
//                         {Array(daysInMonth).fill().map((_, i) => {
//                             const dateStr = new Date(year, month, i + 1).toDateString();
//                             const score = solvedScoresByDate.get(dateStr) || 0;
//                             const isToday = dateStr === today.toDateString();
//                             return (
//                                 <div 
//                                     key={i} 
//                                     className={`aspect-square rounded-md ${getActivityLevelColor(score, isDarkMode)} ${isToday ? 'ring-1 ring-white' : ''} transition-all hover:scale-110 cursor-help`} 
//                                     title={`${new Date(year, month, i+1).toLocaleDateString()}: ${score} points`}
//                                 />
//                             );
//                         })}
//                     </div>
//                 </motion.div>

//                 {/* Popular Topics (Re-styled) */}
//                 <motion.div
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: 0.3 }}
//                     className={`${componentBg} border ${componentBorder} rounded-2xl p-5 shadow-sm`}
//                 >
//                     <h3 className={`text-sm font-bold ${textPrimary} flex items-center gap-2 mb-4 uppercase tracking-wider`}>
//                         <FolderOpen className="w-4 h-4 text-emerald-500" /> Popular Topics
//                     </h3>
//                     <div className="flex flex-wrap gap-2">
//                         {popularTopics.map(topic => (
//                             <button 
//                                 key={topic.name} 
//                                 className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all hover:scale-105 ${getTagColor(topic.name, isDarkMode)}`}
//                                 onClick={() => setFilters({...filters, tag: topic.name.toLowerCase().replace(/\s/g, '')})}
//                             >
//                                 {topic.name}
//                             </button>
//                         ))}
//                     </div>
//                 </motion.div>

//             </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Homepage;

// try and error version 

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import {
    Code2, Sun, Moon, Menu, X, Search,
    ChevronRight, CheckCircle2, Circle, ChevronLeft,
    LogOut, Filter, ChevronDown, AlertCircle, ShieldAlert,
    User, BookOpen, Trophy, Zap, Calendar as CalendarIcon, LogIn
} from 'lucide-react';
import CreditDisplay from '../components/CreditDisplay';

// --- Constants ---
const ITEMS_PER_PAGE = 15;

// --- Flashcard Data (Expanded & Detailed) ---
const ALGO_CONCEPTS = [
    {
        title: "Sliding Window",
        desc: "Optimizes nested loops by maintaining a 'window' of elements. As the window moves, we add one element and remove one, keeping the calculation efficient.",
        example: "Max sum of subarray of size k: Add next element, subtract first element of previous window.",
        time: "O(N)",
        space: "O(1)"
    },
    {
        title: "Two Pointers",
        desc: "Uses two indices (pointers) to traverse a data structure, often from different ends, to find a pair or condition efficiently without nested loops.",
        example: "Two Sum (Sorted): Left pointer at start, right at end. If sum < target, left++. If sum > target, right--.",
        time: "O(N)",
        space: "O(1)"
    },
    {
        title: "Floyd's Cycle Finding",
        desc: "Detects a cycle in a linked list using two pointers moving at different speeds (Slow: 1 step, Fast: 2 steps). If they meet, a cycle exists.",
        example: "Linked List Cycle: fast = head, slow = head. While fast && fast.next: slow = slow.next, fast = fast.next.next.",
        time: "O(N)",
        space: "O(1)"
    },
    {
        title: "Binary Search",
        desc: "Finds an item in a sorted list by repeatedly dividing the search interval in half. Extremely faster than linear search for large datasets.",
        example: "Find target: Check middle. If target < mid, search left half. If target > mid, search right half.",
        time: "O(log N)",
        space: "O(1)"
    },
    {
        title: "Kadane's Algorithm",
        desc: "Finds the maximum sum contiguous subarray. It iterates through the array, calculating the max sum ending at each position.",
        example: "currSum = max(num, currSum + num); maxSum = max(maxSum, currSum). Handles negative numbers gracefully.",
        time: "O(N)",
        space: "O(1)"
    },
    {
        title: "Breadth First Search (BFS)",
        desc: "Traverses a graph level by level using a Queue. Essential for finding the shortest path in unweighted graphs.",
        example: "Level Order Traversal: Push root to queue. While queue not empty, pop node, process it, push all unvisited neighbors.",
        time: "O(V+E)",
        space: "O(V)"
    },
    {
        title: "Depth First Search (DFS)",
        desc: "Traverses a graph depth-wise using Recursion (Stack). Good for pathfinding, topological sorting, and cycle detection.",
        example: "Recursion: visit(node), mark visited. For each neighbor: if not visited, visit(neighbor).",
        time: "O(V+E)",
        space: "O(V)"
    }
];

// --- Helper Functions ---
const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
        case 'easy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        case 'hard': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
        default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
};

const formatTagName = (tag) => {
    if (!tag) return 'Uncategorized';
    if (tag.toLowerCase() === 'dp') return 'Dynamic Programming';
    return tag.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

// --- Sub-Components (Skeleton Loader) ---
const TableSkeleton = ({ isDarkMode }) => (
    <div className="w-full animate-pulse">
        <div className={`h-10 mb-4 rounded-lg ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'}`} />
        <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
                <div key={i} className={`h-16 rounded-xl ${isDarkMode ? 'bg-zinc-900/50' : 'bg-gray-100'}`} />
            ))}
        </div>
    </div>
);

// --- Custom Hooks ---
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// --- Main Component ---
function Homepage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // --- UI State ---
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Data State ---
    const [problems, setProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [tagStats, setTagStats] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    // --- Filter & Pagination State ---
    const [filters, setFilters] = useState({ difficulty: 'all', tag: 'all', status: 'all' });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 400);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAllTags, setShowAllTags] = useState(false);

    // --- 1. Fetch Problem Stats (Tags for Filter) ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axiosClient.get('/problem/stats');
                // Transform API response { name, count } to template format { key, original, count }
                const transformedTags = (res.data.tags || []).map(t => ({
                    key: (t.name || 'other').toLowerCase().replace(/\s/g, ''),
                    original: t.name || 'other',
                    count: t.count
                }));
                setTagStats(transformedTags);
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };
        fetchStats();
    }, []);

    // --- 2. Fetch Solved Problems (once on user change) ---
    useEffect(() => {
        const fetchSolved = async () => {
            if (user) {
                try {
                    const res = await axiosClient.get('/problem/problemSolvedByUser');
                    setSolvedProblems(res.data || []);
                } catch (err) {
                    console.error('Error fetching solved problems:', err);
                }
            } else {
                setSolvedProblems([]);
            }
        };
        fetchSolved();
    }, [user]);

    // --- 3. Fetch Problems (Server-Side Pagination) ---
    useEffect(() => {
        const fetchProblems = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Build query string
                const params = new URLSearchParams({
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                });

                if (debouncedSearch) params.append('search', debouncedSearch);
                if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
                if (filters.tag !== 'all') params.append('tag', filters.tag);
                // Note: status filtering still client-side since it needs user's solved list

                const res = await axiosClient.get(`/problem/getAllProblem?${params.toString()}`);

                const formattedProblems = (res.data.problems || []).map((p, index) => ({
                    ...p,
                    tags: p.tags || 'other',
                    displayNumber: ((currentPage - 1) * ITEMS_PER_PAGE) + index + 1,
                    acceptance: p.acceptance || `${(p.title.length * 2) % 60 + 30}%`
                }));

                setProblems(formattedProblems);
                setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
            } catch (err) {
                console.error('Error fetching problems:', err);
                setError("Failed to load challenges. Please check your connection.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProblems();
    }, [currentPage, debouncedSearch, filters.difficulty, filters.tag]);

    // Reset to page 1 when filters/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, filters.difficulty, filters.tag, filters.status]);

    // --- 4. Theme Logic ---
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) setIsDarkMode(savedTheme === 'dark');
        else setIsDarkMode(true);
    }, []);

    const toggleTheme = useCallback(() => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    }, [isDarkMode]);

    // --- 5. Navigation Handlers ---
    const handleLogout = useCallback(() => {
        dispatch(logoutUser());
        setSolvedProblems([]);
        navigate('/');
    }, [dispatch, navigate]);

    const handleNavClick = (path) => {
        setMobileMenuOpen(false);
        navigate(path);
    };

    // --- 6. Client-Side Status Filter (Solved/Unsolved) ---
    const currentProblems = useMemo(() => {
        if (filters.status === 'all') return problems;

        return problems.filter(problem => {
            const isSolved = solvedProblems.some(sp => sp._id === problem._id);
            if (filters.status === 'solved') return isSolved;
            if (filters.status === 'unsolved') return !isSolved;
            return true;
        });
    }, [problems, solvedProblems, filters.status]);

    // Use server pagination info
    const totalPages = pagination.pages;

    // --- 5. UI Logic (Flashcard & Progress) ---
    const dailyConcept = useMemo(() => {
        const today = new Date();
        const dateString = today.toDateString();
        let hash = 0;
        for (let i = 0; i < dateString.length; i++) hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
        const index = Math.abs(hash) % ALGO_CONCEPTS.length;
        return ALGO_CONCEPTS[index];
    }, []);

    const weeklyData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        return days.map((dayLabel, index) => {
            const checkDate = new Date(startOfWeek);
            checkDate.setDate(startOfWeek.getDate() + index);
            const hasSolved = solvedProblems.some(p => {
                const solvedDate = new Date(p.createdAt || p.updatedAt || new Date());
                return solvedDate.toDateString() === checkDate.toDateString();
            });
            return { day: dayLabel[0], fullDay: dayLabel, active: hasSolved, isToday: checkDate.toDateString() === today.toDateString() };
        });
    }, [solvedProblems]);

    // --- Styles ---
    const bgMain = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-[#f9fafb]';
    const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-gray-900';
    const textSecondary = isDarkMode ? 'text-zinc-400' : 'text-gray-500';
    const cardBg = isDarkMode ? 'bg-[#121212]' : 'bg-white';
    const borderCol = isDarkMode ? 'border-zinc-800' : 'border-gray-200';
    const inputBg = isDarkMode ? 'bg-[#181818]' : 'bg-gray-50';

    return (
        <div className={`min-h-screen ${bgMain} font-sans selection:bg-emerald-500/30 transition-colors duration-300`}>

            {/* --- NAVBAR --- */}
            <nav className={`fixed top-0 left-0 right-0 z-50 border-b ${borderCol} ${isDarkMode ? 'bg-[#0a0a0a]/80' : 'bg-white/80'} backdrop-blur-md`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Code2 className="w-5 h-5 text-white" />
                            </div>
                            <span className={`text-lg font-bold tracking-tight ${textPrimary}`}>NIRNAY</span>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {['Home', 'Courses', 'Practice',  'Flow'].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => handleNavClick(item === 'Home' ? '/' : item === 'Practice' ? '/Homepage' : item === 'Flow' ? '/learning-path' : `/${item}`)}
                                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${item === 'Practice'
                                        ? 'bg-emerald-500/10 text-emerald-600'
                                        : `${textSecondary} hover:${textPrimary}`
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="relative group">
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary} group-focus-within:text-emerald-500 transition-colors`} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-64 pl-9 pr-4 py-2 text-sm rounded-xl border ${borderCol} ${inputBg} ${textPrimary} focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all`}
                                />
                            </div>

                            <button onClick={toggleTheme} className={`p-2 rounded-full border ${borderCol} ${cardBg} hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${textSecondary}`}>
                                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>

                            {/* Credit Display - Only show when logged in */}
                            {user && <CreditDisplay onClick={() => navigate('/buy-credits')} />}

                            {/* AUTH LOGIC: Show Profile or Sign In */}
                            {user ? (
                                <div className="flex items-center gap-3 pl-3 border-l border-zinc-700/20">
                                    {/* Profile Icon */}
                                    <button
                                        onClick={() => navigate('/UserProfile')}
                                        className={`w-8 h-8 rounded-full border ${borderCol} flex items-center justify-center overflow-hidden transition-all hover:border-emerald-500 hover:scale-105 shadow-sm`}
                                        title="My Profile"
                                    >
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                                                {/* Show initial or Icon */}
                                                {user.firstName ? (
                                                    <span className="text-xs font-bold text-emerald-500">{user.firstName[0].toUpperCase()}</span>
                                                ) : (
                                                    <User className={`w-4 h-4 ${textSecondary}`} />
                                                )}
                                            </div>
                                        )}
                                    </button>

                                    {user.role === 'admin' && (
                                        <button onClick={() => navigate('/admin')} className={`p-2 rounded-full border ${borderCol} hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${textSecondary}`} title="Admin Panel">
                                            <ShieldAlert className="w-4 h-4" />
                                        </button>
                                    )}

                                    <button onClick={handleLogout} className={`p-2 rounded-full border ${borderCol} hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${textSecondary}`} title="Logout">
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 pl-3 border-l border-zinc-700/20">
                                    <button
                                        onClick={() => navigate('/Login')}
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/10"
                                    >
                                        <LogIn className="w-4 h-4" /> Sign In
                                    </button>
                                </div>
                            )}
                        </div>

                        <button className={`md:hidden ${textPrimary}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`md:hidden border-t ${borderCol} overflow-hidden`}
                        >
                            <div className="px-4 py-3 space-y-1">
                                {[
                                    { name: 'Home', path: '/' },
                                    { name: 'Courses', path: '/Courses' },
                                    { name: 'Practice', path: '/Homepage' },
                                    { name: 'Visualizer', path: '/Visualizer' },
                                    { name: '🗺️ Flow', path: '/learning-path' },
                                ].map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => handleNavClick(item.path)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                            ${item.name.includes('Flow')
                                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                : `${textSecondary} hover:bg-zinc-800/50 hover:${textPrimary}`
                                            }`}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* --- MAIN LAYOUT --- */}
            <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* 1. TOPICS SECTION (Top - Full Width) */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>Popular Topics</h2>
                        {tagStats.length > 12 && (
                            <button onClick={() => setShowAllTags(!showAllTags)} className={`text-xs font-medium text-emerald-500 hover:underline`}>
                                {showAllTags ? 'Show Less' : 'View All'}
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex gap-2 animate-pulse">
                            {[...Array(6)].map((_, i) => <div key={i} className={`h-8 w-24 rounded-lg ${isDarkMode ? 'bg-zinc-900' : 'bg-gray-200'}`} />)}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {tagStats.slice(0, showAllTags ? tagStats.length : 14).map((tagObj) => {
                                const isActive = filters.tag === tagObj.original;
                                return (
                                    <button
                                        key={tagObj.key}
                                        onClick={() => setFilters({ ...filters, tag: isActive ? 'all' : tagObj.original })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 flex items-center gap-2
                                        ${isActive
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                                                : `${cardBg} ${borderCol} ${textSecondary} hover:border-emerald-500/50 hover:text-emerald-500`
                                            }`}
                                    >
                                        {formatTagName(tagObj.original)}
                                        <span className={`text-[10px] px-1.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                            {tagObj.count}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* 2. GRID LAYOUT: 60% Left | 40% Right */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* --- LEFT COLUMN: QUESTIONS LIST (60% Width) --- */}
                    <div className="lg:col-span-3">
                        {/* Filters Row */}
                        <div className="flex flex-col sm:flex-row justify-between items-end mb-5 gap-4">
                            <div className="flex gap-3 w-full sm:w-auto">
                                <div className="relative">
                                    <select
                                        value={filters.difficulty}
                                        onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                                        className={`appearance-none pl-3 pr-8 py-2 text-xs font-medium rounded-lg border ${borderCol} ${cardBg} ${textPrimary} focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer shadow-sm min-w-[120px]`}
                                    >
                                        <option value="all">Difficulty</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                    <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${textSecondary} pointer-events-none`} />
                                </div>
                                <div className="relative">
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                        className={`appearance-none pl-3 pr-8 py-2 text-xs font-medium rounded-lg border ${borderCol} ${cardBg} ${textPrimary} focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer shadow-sm min-w-[120px]`}
                                    >
                                        <option value="all">Status</option>
                                        <option value="solved">Solved</option>
                                        <option value="unsolved">Unsolved</option>
                                    </select>
                                    <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${textSecondary} pointer-events-none`} />
                                </div>
                            </div>
                            {!isLoading && (
                                <div className={`text-xs font-medium ${textSecondary}`}>
                                    Showing {currentProblems.length} of {pagination.total} problems
                                </div>
                            )}
                        </div>

                        {/* List Table */}
                        {error ? (
                            <div className="p-8 rounded-xl border border-rose-500/20 bg-rose-500/5 text-center">
                                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-rose-500">Failed to load</h3>
                                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-md text-sm hover:bg-rose-700 transition-colors">Retry</button>
                            </div>
                        ) : isLoading ? (
                            <TableSkeleton isDarkMode={isDarkMode} />
                        ) : (
                            <div className={`w-full overflow-hidden rounded-xl border ${borderCol} ${cardBg} shadow-sm`}>
                                <div className={`grid grid-cols-12 gap-4 px-6 py-3 border-b ${borderCol} ${isDarkMode ? 'bg-zinc-900/40' : 'bg-gray-50'} text-[11px] font-bold uppercase tracking-wider ${textSecondary}`}>
                                    <div className="col-span-1">Status</div>
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-6">Title</div>
                                    <div className="col-span-2">Acceptance</div>
                                    <div className="col-span-2">Difficulty</div>
                                </div>

                                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    <AnimatePresence>
                                        {currentProblems.map((problem, index) => {
                                            const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                                            return (
                                                <motion.button
                                                    key={problem._id}
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    onClick={() => navigate(`/problem/${problem._id}`)}
                                                    className={`w-full text-left grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer transition-colors duration-200 
                                                        ${isDarkMode ? 'hover:bg-zinc-900' : 'hover:bg-gray-50'}
                                                    `}
                                                >
                                                    <div className="col-span-1">
                                                        {isSolved
                                                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                            : <Circle className={`w-4 h-4 ${textSecondary} opacity-30`} />
                                                        }
                                                    </div>
                                                    <div className={`col-span-1 text-xs ${textSecondary} font-mono`}>{problem.displayNumber}</div>
                                                    <div className="col-span-6"><h3 className={`text-sm font-medium ${textPrimary} group-hover:text-emerald-500 transition-colors truncate`}>{problem.title}</h3></div>
                                                    <div className={`col-span-2 text-xs ${textSecondary}`}>{problem.acceptance}</div>
                                                    <div className="col-span-2">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${getDifficultyColor(problem.difficulty)}`}>
                                                            {problem.difficulty}
                                                        </span>
                                                    </div>
                                                </motion.button>
                                            )
                                        })}
                                    </AnimatePresence>
                                </div>
                                {currentProblems.length === 0 && (
                                    <div className="text-center py-20 px-4">
                                        <h3 className={`text-lg font-medium ${textPrimary}`}>No matches found</h3>
                                        <button onClick={() => { setSearchTerm(''); setFilters({ difficulty: 'all', tag: 'all', status: 'all' }) }} className={`mt-2 text-sm font-medium hover:underline ${textSecondary}`}>Clear filters</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {!isLoading && !error && totalPages > 1 && (
                            <div className="flex justify-between items-center mt-6">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`p-2 rounded-lg border ${borderCol} ${cardBg} disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors`}>
                                    <ChevronLeft className={`w-4 h-4 ${textPrimary}`} />
                                </button>
                                <span className={`text-xs font-medium ${textSecondary}`}>Page {currentPage} of {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`p-2 rounded-lg border ${borderCol} ${cardBg} disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors`}>
                                    <ChevronRight className={`w-4 h-4 ${textPrimary}`} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN: SIDEBAR (40% Width) --- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. 🧠 ALGO FLASHCARD */}
                        <div className={`relative overflow-hidden rounded-2xl border ${borderCol} ${cardBg} shadow-lg group`}>
                            {/* Header Gradient */}
                            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-700`}></div>

                            <div className="p-6">
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className={`text-xs font-bold uppercase tracking-widest ${textSecondary} flex items-center gap-2`}>
                                        <BookOpen className="w-4 h-4 text-emerald-500" />
                                        Concept of the Day
                                    </h3>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'}`}>
                                        #Learn
                                    </span>
                                </div>

                                <div className="mb-6">
                                    <h4 className={`text-lg font-bold ${textPrimary} mb-2`}>
                                        {dailyConcept.title}
                                    </h4>
                                    <p className={`text-xs ${textSecondary} leading-relaxed bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-dashed ${borderCol} mb-3`}>
                                        {dailyConcept.desc}
                                    </p>
                                    {dailyConcept.example && (
                                        <div className={`text-[11px] ${textPrimary} font-mono bg-emerald-500/10 p-2 rounded border border-emerald-500/20`}>
                                            <span className="text-emerald-500 font-bold mr-1">Ex:</span> {dailyConcept.example}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className={`text-center p-2.5 rounded-lg border ${borderCol} ${cardBg}`}>
                                        <span className="block text-xs font-bold text-emerald-500 mb-1">{dailyConcept.time}</span>
                                        <span className={`text-[10px] ${textSecondary}`}>Time</span>
                                    </div>
                                    <div className={`text-center p-2.5 rounded-lg border ${borderCol} ${cardBg}`}>
                                        <span className="block text-xs font-bold text-emerald-500 mb-1">{dailyConcept.space}</span>
                                        <span className={`text-[10px] ${textSecondary}`}>Space</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. 🔥 WEEKLY PROGRESS */}
                        {user ? (
                            <div className={`p-6 rounded-2xl border ${borderCol} ${cardBg} shadow-sm`}>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className={`text-xs font-bold uppercase tracking-widest ${textSecondary} flex items-center gap-2`}>
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                        Weekly Streak
                                    </h3>
                                    <span className={`text-xs font-bold ${textPrimary}`}>
                                        {weeklyData.filter(d => d.active).length} <span className={textSecondary}>/ 7</span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    {weeklyData.map((dayObj, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1.5 group">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300
                                                ${dayObj.active
                                                    ? 'bg-emerald-500 border-emerald-500 text-black shadow-md shadow-emerald-500/20'
                                                    : dayObj.isToday
                                                        ? `border-emerald-500 ${textPrimary}`
                                                        : `border-transparent ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-100'} ${textSecondary}`
                                                }
                                            `}>
                                                {dayObj.active ? <CheckCircle2 className="w-4 h-4" /> : dayObj.day}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className={`text-[10px] ${textSecondary} text-center mt-5`}>
                                    Keep the momentum going!
                                </p>
                            </div>
                        ) : (
                            <div className={`p-6 rounded-2xl border ${borderCol} ${cardBg} shadow-sm text-center`}>
                                <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                                <h3 className={`text-sm font-bold ${textPrimary} mb-2`}>Track Your Progress</h3>
                                <p className={`text-xs ${textSecondary} mb-4`}>Sign in to see your weekly streak and solve history.</p>
                                <button onClick={() => navigate('/Login')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
                                    Sign In Now
                                </button>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}

export default Homepage;