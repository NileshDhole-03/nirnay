import React, { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { Trophy, Medal, Flame, Search, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // ✅ Fetch data from backend
                const response = await axiosClient.get('/user/getleaderboard');

                // ✅ Filter nulls to prevent crashes
                const validUsers = response.data.filter(u => u !== null);
                setUsers(validUsers);
            } catch (error) {
                console.error("Error fetching leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    // 🔍 Search Logic
    const filteredUsers = users.filter(user => {
        const fName = user?.firstName || "";
        const lName = user?.lastName || "";
        const fullName = `${fName} ${lName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    // Split Top 3 vs The Rest
    const TopThree = users.slice(0, 3);

    // If searching, show matches from ALL users. If not searching, exclude Top 3 from the table.
    const tableData = searchTerm ? filteredUsers : filteredUsers.filter(u => !TopThree.includes(u));

    if (loading) return (
        <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-emerald-500 font-medium animate-pulse">Summoning Champions...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 pb-12 px-4 md:px-8 font-sans selection:bg-yellow-500/30 relative overflow-hidden">

            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 relative z-10"
            >
                <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 tracking-tight mb-4 drop-shadow-2xl">
                    HALL OF FAME
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                    Top developers competing for glory. Solve problems, earn points, and claim your throne.
                </p>
            </motion.div>

            {/* --- PODIUM SECTION (Top 3) --- */}
            {/* Only show podium if NOT searching (to avoid layout breakage) */}
            {!searchTerm && users.length > 0 && (
                <div className="max-w-5xl mx-auto mb-16 relative z-10">
                    <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-8">
                        {users[1] && <PodiumCard user={users[1]} rank={2} delay={0.2} />}
                        {users[0] && <PodiumCard user={users[0]} rank={1} delay={0} />}
                        {users[2] && <PodiumCard user={users[2]} rank={3} delay={0.4} />}
                    </div>
                </div>
            )}

            {/* --- SEARCH & LIST SECTION --- */}
            <div className="max-w-4xl mx-auto relative z-10">

                {/* Search Bar */}
                <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-2 mb-6 flex items-center shadow-xl focus-within:border-emerald-500/50 transition-colors">
                    <Search className="w-5 h-5 text-gray-400 ml-3" />
                    <input
                        type="text"
                        placeholder="Search for a coder..."
                        className="bg-transparent border-none outline-none text-white w-full px-4 py-2 placeholder:text-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Table Container */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl"
                >
                    <table className="w-full text-left">
                        <thead className="bg-[#27272a]/50 text-xs uppercase text-gray-400 font-semibold">
                            <tr>
                                <th className="p-4 pl-6">Rank</th>
                                <th className="p-4">Coder</th>
                                <th className="p-4 text-center hidden sm:table-cell">Solved</th>
                                <th className="p-4 pr-6 text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272a]">
                            {tableData.map((user, idx) => {
                                // Calculate True Rank based on global list
                                const realRank = users.findIndex(u => u._id === user._id) + 1;
                                return <UserRow key={user._id || idx} user={user} rank={realRank} index={idx} />;
                            })}

                            {tableData.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <p>No coders found matching "{searchTerm}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const PodiumCard = ({ user, rank, delay }) => {
    const navigate = useNavigate();

    // 🛡️ Safe Data Access
    const fName = user?.firstName || "Unknown";
    const lName = user?.lastName || "";
    const displayName = `${fName} ${lName}`.trim();
    const initial = String(fName).charAt(0).toUpperCase();

    // Visual Styles per Rank
    const styles = {
        1: { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: <Crown className="w-8 h-8 fill-yellow-400 text-yellow-500 animate-bounce" />, height: 'h-64 md:h-80', order: 'order-1 md:order-2', glow: 'shadow-[0_0_50px_-12px_rgba(234,179,8,0.3)]' },
        2: { border: 'border-gray-400', bg: 'bg-gray-400/10', text: 'text-gray-300', icon: <Medal className="w-6 h-6 text-gray-300" />, height: 'h-56 md:h-64', order: 'order-2 md:order-1', glow: 'shadow-[0_0_30px_-12px_rgba(156,163,175,0.2)]' },
        3: { border: 'border-orange-600', bg: 'bg-orange-600/10', text: 'text-orange-500', icon: <Medal className="w-6 h-6 text-orange-600" />, height: 'h-56 md:h-64', order: 'order-3', glow: 'shadow-[0_0_30px_-12px_rgba(234,88,12,0.2)]' }
    };
    const style = styles[rank];

    return (
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
            onClick={() => navigate(`/UserProfile/${user._id}`)} // 👈 Navigation Action
            className={`
                cursor-pointer relative flex flex-col items-center justify-end p-6 rounded-3xl border-2 backdrop-blur-sm
                w-full md:w-1/3 max-w-[280px]
                ${style.height} ${style.border} ${style.bg} ${style.order} ${style.glow}
                group hover:-translate-y-2 transition-transform duration-300 hover:brightness-110
            `}
        >
            {/* Rank Badge */}
            <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-[#09090b] border-2 z-20 ${style.border} ${style.text}`}>
                {rank}
            </div>

            {/* Avatar */}
            <div className={`relative mb-4 ${rank === 1 ? 'scale-125' : ''}`}>
                <div className={`w-20 h-20 rounded-full border-4 ${style.border} flex items-center justify-center bg-[#18181b] overflow-hidden`}>
                    <span className={`text-3xl font-bold ${style.text}`}>{initial}</span>
                </div>
                {rank === 1 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                        {style.icon}
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="text-center w-full z-10">
                <h3 className="font-bold text-white text-lg truncate w-full px-2 mb-1">{displayName}</h3>
                <div className="flex items-center justify-center gap-2 mb-3">
                    <span className={`text-2xl font-black ${style.text}`}>{user.score || 0}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-500">PTS</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#09090b]/50 border border-white/10 text-xs text-gray-400">
                    <Flame className="w-3 h-3 text-orange-500" />
                    {user?.problemSolved?.length || 0} Solved
                </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] rounded-3xl z-0"></div>
        </motion.div>
    );
};

const UserRow = ({ user, rank, index }) => {
    const navigate = useNavigate();

    // 🛡️ Safe Data Access
    const fName = user?.firstName || "Unknown";
    const lName = user?.lastName || "";
    const displayName = `${fName} ${lName}`.trim();
    const initial = String(fName).charAt(0).toUpperCase();
    const email = user?.emailId || "No Email";

    return (
        <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * Math.min(index, 10) }}
            onClick={() => navigate(`/UserProfile/${user._id}`)} // 👈 Navigation Action
            className="group border-b border-[#27272a] hover:bg-[#27272a]/40 transition-colors cursor-pointer"
        >
            <td className="p-4 pl-6">
                <span className={`font-mono font-bold transition-colors ${rank <= 3 ? 'text-yellow-500' : 'text-gray-500 group-hover:text-white'}`}>
                    #{rank}
                </span>
            </td>
            <td className="p-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-sm font-bold text-gray-300 group-hover:border-emerald-500/50 transition-colors">
                        {initial}
                    </div>
                    <div>
                        <div className="font-bold text-gray-200 group-hover:text-emerald-400 transition-colors">
                            {displayName}
                        </div>
                        <div className="text-xs text-gray-500">{email}</div>
                    </div>
                </div>
            </td>
            <td className="p-4 text-center hidden sm:table-cell">
                <span className="text-sm text-gray-400 font-medium">
                    {user?.problemSolved?.length || 0}
                </span>
            </td>
            <td className="p-4 pr-6 text-right">
                <div className="flex items-center justify-end gap-2">
                    <span className="text-lg font-bold text-white group-hover:scale-110 transition-transform">
                        {user.score || 0}
                    </span>
                    <span className="text-[10px] text-gray-600 font-bold uppercase mt-1">PTS</span>
                </div>
            </td>
        </motion.tr>
    );
}

export default Leaderboard;