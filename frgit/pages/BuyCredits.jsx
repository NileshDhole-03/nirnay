import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Coins, Check, Zap, ArrowLeft, Loader2, Clock, Flame, Trophy } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const packages = [
    {
        id: 'starter',
        name: 'Starter Pack',
        price: 49,
        credits: 100,
        popular: false,
        badge: null,
        icon: Coins,
        color: 'from-sky-500/20 to-blue-500/10',
        borderColor: 'border-sky-500/30',
        btnColor: 'bg-sky-500 hover:bg-sky-400 text-white',
        iconColor: 'text-sky-400',
        problemsCanSolve: '~9',
        pricePerCredit: '₹0.49',
        features: [
            '100 credits (60-day expiry)',
            '~9 problems you can fully solve',
            '100 runs or 20 submissions',
            '5 solution views',
        ],
    },
    {
        id: 'pro',
        name: 'Pro Pack',
        price: 149,
        credits: 400,
        popular: true,
        badge: 'Most Popular',
        icon: Flame,
        color: 'from-emerald-500/20 to-cyan-500/10',
        borderColor: 'border-emerald-500/50',
        btnColor: 'bg-emerald-500 hover:bg-emerald-400 text-black font-bold',
        iconColor: 'text-emerald-400',
        problemsCanSolve: '~36',
        pricePerCredit: '₹0.37',
        features: [
            '400 credits (60-day expiry)',
            '~36 problems you can fully solve',
            '400 runs or 80 submissions',
            '20 solution views',
        ],
    },
    {
        id: 'hustler',
        name: 'Hustler Pack',
        price: 299,
        credits: 1000,
        popular: false,
        badge: 'Best Value',
        icon: Trophy,
        color: 'from-amber-500/20 to-orange-500/10',
        borderColor: 'border-amber-500/30',
        btnColor: 'bg-amber-500 hover:bg-amber-400 text-black font-bold',
        iconColor: 'text-amber-400',
        problemsCanSolve: '~90',
        pricePerCredit: '₹0.30',
        features: [
            '1000 credits (60-day expiry)',
            '~90 problems you can fully solve',
            '1000 runs or 200 submissions',
            '50 solution views',
        ],
    },
];

const BuyCredits = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [balance, setBalance] = useState({ credits: 0, creditExpiry: null });

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const { data } = await axiosClient.get('/credit/balance');
            setBalance(data);
        } catch (err) {
            console.error('Failed to fetch balance:', err);
        }
    };

    const formatExpiry = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const loadRazorpayScript = () => new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

    const handlePurchase = async (packageId) => {
        try {
            setLoading(true);
            setSelectedPackage(packageId);

            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                alert('Failed to load payment gateway. Please try again.');
                return;
            }

            const { data } = await axiosClient.post('/payment/create-order', { packageType: packageId });

            const options = {
                key: data.razorpayKeyId,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'Nirnay',
                description: data.package.name,
                order_id: data.order.id,
                handler: async function (response) {
                    try {
                        const verifyResponse = await axiosClient.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            packageType: packageId
                        });
                        if (verifyResponse.data.success) {
                            if (window.refreshCredits) window.refreshCredits();
                            fetchBalance();
                            const expiry = verifyResponse.data.expiresOn;
                            alert(`✅ Payment successful!\n${verifyResponse.data.creditsAdded} credits added.\nExpires on: ${expiry}`);
                            navigate('/Homepage');
                        }
                    } catch (err) {
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: { name: '', email: '' },
                theme: { color: '#10b981' },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        setSelectedPackage(null);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error('Purchase error:', err);
            alert('Failed to initiate payment. Please try again.');
        } finally {
            setLoading(false);
            setSelectedPackage(null);
        }
    };

    const expiryStr = formatExpiry(balance.creditExpiry);

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            {/* Background glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10">

                {/* Back */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Buy Credits
                        </span>
                    </h1>
                    <p className="text-zinc-500 text-sm max-w-xl mx-auto">
                        Credits power your runs, submissions, and solution views. All purchased credits expire 60 days after purchase.
                    </p>

                    {/* Balance display */}
                    <div className="mt-5 inline-flex flex-col items-center gap-1 px-6 py-3 bg-zinc-900 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-emerald-400" />
                            <span className="text-zinc-400 text-sm">Current Balance:</span>
                            <span className="text-white font-bold">{balance.credits} credits</span>
                        </div>
                        {expiryStr && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-400">
                                <Clock className="w-3 h-3" />
                                Expires: {expiryStr}
                            </div>
                        )}
                        {!expiryStr && balance.credits > 0 && (
                            <div className="text-xs text-zinc-600">Free credits · Never expire</div>
                        )}
                    </div>
                </motion.div>

                {/* Plans grid */}
                <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-14">
                    {packages.map((pkg, i) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative bg-gradient-to-b ${pkg.color} rounded-2xl border ${pkg.borderColor} p-6 flex flex-col`}
                        >
                            {/* Badge */}
                            {pkg.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-1 bg-emerald-500 text-black text-[11px] font-bold rounded-full whitespace-nowrap">
                                        {pkg.badge}
                                    </span>
                                </div>
                            )}

                            {/* Icon + Name */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                    <pkg.icon className={`w-5 h-5 ${pkg.iconColor}`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{pkg.name}</h3>
                                    <p className="text-xs text-zinc-500">{pkg.pricePerCredit}/credit</p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-1">
                                <span className="text-3xl font-black text-white">₹{pkg.price}</span>
                                <span className="text-zinc-500 text-sm ml-1">one-time</span>
                            </div>
                            <p className="text-xs text-zinc-600 mb-5">{pkg.credits} credits · ~{pkg.problemsCanSolve} problems</p>

                            {/* Features */}
                            <ul className="space-y-2 mb-6 flex-1">
                                {pkg.features.map((f, j) => (
                                    <li key={j} className="flex items-start gap-2 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {/* Expiry notice */}
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-500/80 mb-3">
                                <Clock className="w-3 h-3" />
                                Credits expire 60 days after purchase
                            </div>

                            {/* Buy button */}
                            <button
                                onClick={() => handlePurchase(pkg.id)}
                                disabled={loading && selectedPackage === pkg.id}
                                className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${pkg.btnColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading && selectedPackage === pkg.id ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                ) : (
                                    <><Zap className="w-4 h-4" /> Buy Now</>
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Credit Usage Table */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="max-w-2xl mx-auto">
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest text-center mb-4">How Credits Are Used</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { action: 'Run Code', cost: '1', icon: '▶️' },
                            { action: 'Submit Easy', cost: '2', icon: '🟢' },
                            { action: 'Submit Medium', cost: '5', icon: '🟡' },
                            { action: 'View Solution', cost: '5', icon: '💡' },
                        ].map((item, i) => (
                            <div key={i} className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-800">
                                <div className="text-xl mb-1">{item.icon}</div>
                                <div className="text-xs text-zinc-500 mb-1">{item.action}</div>
                                <div className="text-base font-bold text-emerald-400">{item.cost} cr</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-zinc-700 text-xs mt-4">
                        Free 50 signup credits never expire · Purchased credits expire in 60 days
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default BuyCredits;
