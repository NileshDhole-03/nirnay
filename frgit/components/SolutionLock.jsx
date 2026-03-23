import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Coins, Play, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';

/**
 * Solution Lock Component
 * Shows locked state for solutions and handles unlock flow
 * 
 * Props:
 * - problemId: string - The problem ID
 * - hasSolutionVideo: boolean - Whether video solution exists
 * - onUnlock: function - Callback when solution is unlocked with solution data
 */
const SolutionLock = ({ problemId, hasSolutionVideo = false, onUnlock }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [access, setAccess] = useState(null);
    const [error, setError] = useState(null);

    // Check if user already has access
    const checkAccess = async () => {
        try {
            setChecking(true);
            const { data } = await axiosClient.get(`/credit/check-solution/${problemId}`);
            setAccess(data);

            if (data.hasAccess) {
                // Already has access, fetch solution
                unlockSolution();
            }
        } catch (err) {
            console.error('Check access error:', err);
        } finally {
            setChecking(false);
        }
    };

    // Unlock solution (pay 5 credits)
    const unlockSolution = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axiosClient.post(`/credit/view-solution/${problemId}`);

            if (data.success) {
                // Refresh credits globally
                if (window.refreshCredits) {
                    window.refreshCredits();
                }

                // Call parent callback with solution data
                if (onUnlock) {
                    onUnlock(data);
                }
            }
        } catch (err) {
            if (err.response?.data?.error === 'INSUFFICIENT_CREDITS') {
                setError('insufficient');
            } else {
                setError('failed');
            }
            console.error('Unlock error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial check on mount
    React.useEffect(() => {
        checkAccess();
    }, [problemId]);

    if (checking) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
        );
    }

    // If already checking and has access, show loading while fetching
    if (access?.hasAccess && loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mr-2" />
                <span className="text-gray-400">Loading solution...</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-white/5 to-white/[0.02] rounded-xl border border-white/10 p-6"
        >
            {/* Lock Icon */}
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-emerald-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Solution Locked</h3>
                <p className="text-gray-400 mb-6 max-w-sm">
                    Unlock the {hasSolutionVideo ? 'video explanation and ' : ''}reference solution for this problem.
                </p>

                {/* Cost Info */}
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full mb-6">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span className="text-white font-medium">5 credits</span>
                    <span className="text-gray-500">to unlock</span>
                </div>

                {/* Error States */}
                {error === 'insufficient' && (
                    <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">
                            Insufficient credits. You need at least 5 credits.
                        </p>
                        <button
                            onClick={() => navigate('/buy-credits')}
                            className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 underline"
                        >
                            Buy more credits →
                        </button>
                    </div>
                )}

                {error === 'failed' && (
                    <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">
                            Failed to unlock solution. Please try again.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={unlockSolution}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 
                                   text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Unlocking...
                            </>
                        ) : (
                            <>
                                <Unlock className="w-5 h-5" />
                                Unlock Solution
                            </>
                        )}
                    </button>
                </div>

                {/* What's included */}
                <div className="mt-6 pt-6 border-t border-white/10 w-full">
                    <p className="text-xs text-gray-500 mb-3">INCLUDES:</p>
                    <div className="flex justify-center gap-6">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Eye className="w-4 h-4" />
                            Reference Code
                        </div>
                        {hasSolutionVideo && (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Play className="w-4 h-4" />
                                Video Explanation
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SolutionLock;
