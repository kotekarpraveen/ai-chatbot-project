import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export default function Billing() {
    const [subscription, setSubscription] = useState({ plan: "Free", status: "none", current_period_end: null });
    const [usage, setUsage] = useState({ messagesUsed: 0 });
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showSuccess, setShowSuccess] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("token");

    const plans = [
        {
            name: "Starter",
            price: "₹2,000",
            features: ["1 Chatbot", "1,000 Messages/month", "5 Documents allowed"],
            limit: 1000
        },
        {
            name: "Pro",
            price: "₹5,000",
            features: ["5 Chatbots", "10,000 Messages/month", "20 Documents allowed"],
            limit: 10000
        },
        {
            name: "Enterprise",
            price: "Custom",
            features: ["Unlimited Chatbots", "Unlimited Messages", "Custom integrations"],
            limit: Infinity
        }
    ];

    useEffect(() => {
        fetchBillingData();
        
        if (searchParams.get("success") === "true") {
            setShowSuccess(true);
            // Clear the param after showing
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("success");
            setSearchParams(newParams, { replace: true });
        }
    }, []);

    const fetchBillingData = async (retryCount = 0) => {
        setLoading(true);
        try {
            const [subRes, usageRes] = await Promise.all([
                axios.get(`${API_URL}/billing/subscription`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/billing/usage`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            // If we just had a success redirect but the plan is still 'Free', wait and retry once
            // This handles cases where the webhook takes a second to update the DB
            if (searchParams.get("success") === "true" && subRes.data.plan === "Free" && retryCount < 2) {
                console.log("Success detected but plan remains 'Free'. Retrying in 2s...");
                setTimeout(() => fetchBillingData(retryCount + 1), 2000);
            } else {
                setSubscription(subRes.data);
                setUsage(usageRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch billing data", error);
        } finally {
            if (retryCount === 0) setLoading(false);
        }
    };

    const handleUpgrade = async (planName) => {
        if (planName === "Enterprise") {
            alert("Please contact our sales team for Enterprise plans.");
            return;
        }

        setActionLoading(planName);
        try {
            const res = await axios.post(`${API_URL}/billing/create-checkout-session`, 
                { plan: planName }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (error) {
            alert(error.response?.data?.error || "Failed to initiate checkout");
        } finally {
            setActionLoading(null);
        }
    };

    const currentPlanLimit = plans.find(p => p.name === subscription.plan)?.limit || (subscription.plan === "Free" ? 1000 : Infinity);
    const usagePercentage = currentPlanLimit === Infinity ? 0 : Math.min(100, (usage.messagesUsed / currentPlanLimit) * 100);

    return (
        <main className="flex-1 flex flex-col h-full bg-white md:rounded-l-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500">
            <div className="px-8 py-6 border-b border-gray-50 backdrop-blur-md bg-white/80 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-[#1a2b4b]">Billing & Subscription</h2>
                    <p className="text-xs text-gray-500">Manage your plan and track usage</p>
                </div>
            </div>

            {showSuccess && (
                <div className="mx-8 mt-6 p-6 bg-green-50 border border-green-100 rounded-[2rem] flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-500 p-3 rounded-2xl shadow-lg shadow-green-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-green-800">Subscription Successful!</h4>
                            <p className="text-sm text-green-600 font-medium">Your <span className="uppercase font-extrabold">{subscription.plan}</span> plan is now active. Welcome aboard!</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowSuccess(false)}
                        className="text-green-400 hover:text-green-600 transition-colors p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Current Plan & Usage */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`${subscription.plan !== "Free" ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-100' : 'bg-[#f8fbff] text-[#1a2b4b] border border-gray-100'} p-8 rounded-[2rem] flex flex-col justify-between transition-all duration-500`}>
                        <div>
                            <p className={`text-xs font-bold ${subscription.plan !== "Free" ? 'text-blue-100' : 'text-gray-400'} uppercase tracking-widest`}>Current Plan</p>
                            <h3 className="text-3xl font-extrabold mt-2 uppercase tracking-tight">{subscription.plan} Plan</h3>
                            {subscription.status === 'active' && (
                                <p className={`text-sm font-bold mt-2 inline-flex items-center gap-1.5 ${subscription.plan !== "Free" ? 'bg-white/20 px-3 py-1 rounded-full' : 'text-green-600'}`}>
                                    <span className={`w-2 h-2 ${subscription.plan !== "Free" ? 'bg-white' : 'bg-green-500'} rounded-full animate-pulse`}></span>
                                    Subscription Active
                                </p>
                            )}
                            {subscription.current_period_end && (
                                <p className={`${subscription.plan !== "Free" ? 'text-blue-100/70' : 'text-gray-500'} text-xs mt-4`}>
                                    Renewing on: {new Date(subscription.current_period_end).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <div className="mt-8">
                            {subscription.plan !== "Free" && (
                                <button className="text-sm font-bold text-white/70 hover:text-white transition-colors underline decoration-white/20 underline-offset-4">
                                    Cancel Subscription
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#f8fbff] p-8 rounded-[2rem] border border-gray-100 space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Usage</p>
                                <h3 className="text-3xl font-extrabold text-[#1a2b4b] mt-2">
                                    {usage.messagesUsed} <span className="text-lg font-normal text-gray-400">/ {currentPlanLimit === Infinity ? "Unlimited" : currentPlanLimit}</span>
                                </h3>
                            </div>
                            <p className="text-sm font-bold text-blue-600">{Math.round(usagePercentage)}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-red-500' : 'bg-blue-600'}`}
                                style={{ width: `${usagePercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 italic">Usage resets on the 1st of every month.</p>
                    </div>
                </section>

                {/* Plans Selection */}
                <section className="space-y-8">
                    <h3 className="text-2xl font-bold text-[#1a2b4b] text-center">Upgrade Your Experience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div 
                                key={plan.name} 
                                className={`relative bg-white border-2 p-8 rounded-[2.5rem] transition-all flex flex-col ${
                                    subscription.plan === plan.name 
                                    ? 'border-blue-600 shadow-xl shadow-blue-50' 
                                    : 'border-gray-100 hover:border-blue-200 hover:shadow-lg'
                                }`}
                            >
                                {subscription.plan === plan.name && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                                        Current Plan
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h4 className="text-xl font-bold text-[#1a2b4b]">{plan.name}</h4>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-3xl font-extrabold">{plan.price}</span>
                                        {plan.name !== "Enterprise" && <span className="text-gray-400 text-sm">/month</span>}
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-start gap-3 text-sm text-gray-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    onClick={() => handleUpgrade(plan.name)}
                                    disabled={subscription.plan === plan.name || actionLoading}
                                    className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 ${
                                        subscription.plan === plan.name
                                        ? 'bg-gray-100 text-gray-400 cursor-default'
                                        : 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700'
                                    }`}
                                >
                                    {actionLoading === plan.name ? "Processing..." : subscription.plan === plan.name ? "Active" : "Select Plan"}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
