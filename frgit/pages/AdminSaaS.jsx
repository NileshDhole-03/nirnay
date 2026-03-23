import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosClient from '../utils/axiosClient';
import {
    Users, DollarSign, CreditCard, TrendingUp, Search,
    ChevronLeft, ChevronRight, RefreshCw, Crown, Coins,
    ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle
} from 'lucide-react';

// =============================================
// STAT CARD COMPONENT
// =============================================
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-zinc-400 text-sm">{title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                {subtitle && <p className="text-zinc-500 text-xs mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
        </div>
        {trend && (
            <div className={`flex items-center gap-1 mt-3 text-xs ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(trend)}% from last month
            </div>
        )}
    </motion.div>
);

// =============================================
// USER ROW COMPONENT
// =============================================
const UserRow = ({ user, onView }) => (
    <tr className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
        <td className="py-4 px-4">
            <div>
                <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                <p className="text-zinc-500 text-sm">{user.emailId}</p>
            </div>
        </td>
        <td className="py-4 px-4">
            {user.isUnlimited ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                    <Crown size={12} /> Unlimited
                </span>
            ) : (
                <span className="text-white font-mono">{user.credits} credits</span>
            )}
        </td>
        <td className="py-4 px-4 text-zinc-400 text-sm">
            {user.totalCreditsUsed || 0} used
        </td>
        <td className="py-4 px-4 text-zinc-500 text-sm">
            {new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td className="py-4 px-4">
            <button onClick={() => onView(user)} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                View
            </button>
        </td>
    </tr>
);

// =============================================
// USER MODAL COMPONENT
// =============================================
const UserModal = ({ user, onClose, onUpdate }) => {
    const [credits, setCredits] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [userDetails, setUserDetails] = useState(user);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axiosClient.get(`/admin-saas/users/${user._id}`);
                setUserDetails(res.data.user);
                setTransactions(res.data.transactions);
            } catch (err) {
                console.error(err);
            }
        };
        fetchDetails();
    }, [user._id]);

    const updateCredits = async () => {
        if (!credits) return;
        setLoading(true);
        try {
            await axiosClient.put(`/admin-saas/users/${user._id}/credits`, {
                amount: parseInt(credits),
                reason
            });
            onUpdate();
            setCredits('');
            setReason('');
            const res = await axiosClient.get(`/admin-saas/users/${user._id}`);
            setUserDetails(res.data.user);
            setTransactions(res.data.transactions);
        } catch (err) {
            alert('Failed to update credits');
        }
        setLoading(false);
    };

    const toggleUnlimited = async () => {
        setLoading(true);
        try {
            await axiosClient.put(`/admin-saas/users/${user._id}/unlimited`, {
                unlimited: !userDetails.isUnlimited
            });
            onUpdate();
            setUserDetails({ ...userDetails, isUnlimited: !userDetails.isUnlimited });
        } catch (err) {
            alert('Failed to update');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">{userDetails.firstName} {userDetails.lastName}</h2>
                        <p className="text-zinc-400 text-sm">{userDetails.emailId}</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">&times;</button>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Status */}
                    <div className="flex gap-4">
                        <div className="flex-1 bg-zinc-800 rounded-xl p-4">
                            <p className="text-zinc-400 text-sm">Credits</p>
                            <p className="text-2xl font-bold text-white">{userDetails.credits}</p>
                        </div>
                        <div className="flex-1 bg-zinc-800 rounded-xl p-4">
                            <p className="text-zinc-400 text-sm">Status</p>
                            <p className={`text-xl font-bold ${userDetails.isUnlimited ? 'text-purple-400' : 'text-white'}`}>
                                {userDetails.isUnlimited ? 'Unlimited' : 'Standard'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Credits (+/-)"
                                value={credits}
                                onChange={(e) => setCredits(e.target.value)}
                                className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500"
                            />
                            <input
                                type="text"
                                placeholder="Reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500"
                            />
                            <button
                                onClick={updateCredits}
                                disabled={loading}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg disabled:opacity-50"
                            >
                                {loading ? '...' : 'Apply'}
                            </button>
                        </div>
                        <button
                            onClick={toggleUnlimited}
                            disabled={loading}
                            className={`w-full py-2 rounded-lg font-medium transition-colors ${userDetails.isUnlimited
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                }`}
                        >
                            {userDetails.isUnlimited ? 'Revoke Unlimited' : 'Grant Unlimited'}
                        </button>
                    </div>

                    {/* Transactions */}
                    <div>
                        <h3 className="text-white font-medium mb-3">Recent Transactions</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {transactions.map((tx, i) => (
                                <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3 text-sm">
                                    <div>
                                        <p className="text-white">{tx.description}</p>
                                        <p className="text-zinc-500 text-xs">{new Date(tx.createdAt).toLocaleString()}</p>
                                    </div>
                                    <span className={tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// =============================================
// MAIN ADMIN SAAS COMPONENT
// =============================================
const AdminSaaS = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    const fetchStats = async () => {
        try {
            const res = await axiosClient.get('/admin-saas/dashboard');
            setStats(res.data.stats);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async (page = 1) => {
        try {
            const res = await axiosClient.get(`/admin-saas/users?page=${page}&search=${search}`);
            setUsers(res.data.users);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchStats(), fetchUsers()]);
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(), 300);
        return () => clearTimeout(timer);
    }, [search]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <RefreshCw className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b]">
            {/* Header */}
            <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">SaaS Admin</h1>
                            <p className="text-zinc-500 text-sm">Manage credits, users & revenue</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {['dashboard', 'users'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'dashboard' && stats && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Revenue"
                                value={`₹${stats.revenue.total.toLocaleString()}`}
                                subtitle={`₹${stats.revenue.thisMonth} this month`}
                                icon={DollarSign}
                                color="bg-emerald-500"
                            />
                            <StatCard
                                title="Total Users"
                                value={stats.users.total}
                                subtitle={`${stats.users.recentSignups} this week`}
                                icon={Users}
                                color="bg-blue-500"
                            />
                            <StatCard
                                title="Unlimited Users"
                                value={stats.users.unlimited}
                                subtitle="Premium subscribers"
                                icon={Crown}
                                color="bg-purple-500"
                            />
                            <StatCard
                                title="Package Sales"
                                value={(stats.revenue.packages.credits10 || 0) + stats.revenue.packages.credits300 + stats.revenue.packages.unlimited}
                                subtitle={`${stats.revenue.packages.credits10 || 0} x 10cr, ${stats.revenue.packages.credits300} x 300cr, ${stats.revenue.packages.unlimited} x Unlimited`}
                                icon={CreditCard}
                                color="bg-amber-500"
                            />
                        </div>

                        {/* Usage Stats */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4">Credit Usage</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(stats.usage).map(([type, data]) => (
                                    <div key={type} className="bg-zinc-800/50 rounded-xl p-4">
                                        <p className="text-zinc-400 text-sm capitalize">{type.replace('_', ' ')}</p>
                                        <p className="text-2xl font-bold text-white">{data.credits} credits</p>
                                        <p className="text-zinc-500 text-xs">{data.count} operations</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        {/* Search */}
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 outline-none focus:border-emerald-500"
                                />
                            </div>
                            <button onClick={() => fetchUsers()} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400">
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        {/* Users Table */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-zinc-800/50">
                                    <tr className="text-left text-zinc-400 text-sm">
                                        <th className="py-3 px-4 font-medium">User</th>
                                        <th className="py-3 px-4 font-medium">Credits</th>
                                        <th className="py-3 px-4 font-medium">Usage</th>
                                        <th className="py-3 px-4 font-medium">Joined</th>
                                        <th className="py-3 px-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <UserRow key={user._id} user={user} onView={setSelectedUser} />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between">
                            <p className="text-zinc-500 text-sm">
                                Showing {users.length} of {pagination.total} users
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fetchUsers(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-zinc-400"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="px-4 py-2 bg-zinc-800 rounded-lg text-white text-sm">
                                    {pagination.page} / {pagination.pages}
                                </span>
                                <button
                                    onClick={() => fetchUsers(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-zinc-400"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* User Modal */}
            {selectedUser && (
                <UserModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onUpdate={() => { fetchUsers(); fetchStats(); }}
                />
            )}
        </div>
    );
};

export default AdminSaaS;
