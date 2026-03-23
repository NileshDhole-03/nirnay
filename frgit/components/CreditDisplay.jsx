import React, { useState, useEffect } from 'react';
import { Coins, Infinity, RefreshCw } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

/**
 * Credit Display Component
 * Shows user's credit balance in navbar or any location
 * Use: <CreditDisplay onClick={() => navigate('/buy-credits')} />
 */
const CreditDisplay = ({ onClick, className = '' }) => {
    const [credits, setCredits] = useState(null);
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBalance = async () => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get('/credit/balance');
            setCredits(data.credits);
            setIsUnlimited(data.isUnlimited);
            setError(null);
        } catch (err) {
            setError('Failed to load');
            console.error('Credit fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    // Expose refresh function via window for global access
    useEffect(() => {
        window.refreshCredits = fetchBalance;
        return () => {
            delete window.refreshCredits;
        };
    }, []);

    if (loading) {
        return (
            <div className={`flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full ${className}`}>
                <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                <span className="text-sm text-gray-400">...</span>
            </div>
        );
    }

    if (error) {
        return (
            <button
                onClick={fetchBalance}
                className={`flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full hover:bg-red-500/20 transition ${className}`}
            >
                <Coins className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Retry</span>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 
                        border border-emerald-500/20 rounded-full hover:border-emerald-500/40 
                        transition-all cursor-pointer group ${className}`}
            title={isUnlimited ? 'Unlimited Credits' : `${credits} credits remaining`}
        >
            {isUnlimited ? (
                <>
                    <Infinity className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">Unlimited</span>
                </>
            ) : (
                <>
                    <Coins className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-white">{credits}</span>
                    <span className="text-xs text-gray-400 hidden sm:inline">credits</span>
                </>
            )}
        </button>
    );
};

export default CreditDisplay;
