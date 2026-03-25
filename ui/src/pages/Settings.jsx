import { useState, useEffect } from "react";
import axios from "axios";

export default function Settings() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
        } catch (error) {
            console.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white md:rounded-l-[3rem]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <main className="flex-1 flex flex-col h-full bg-[#f8fbff] md:rounded-l-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500 overflow-y-auto">
              <div className="px-8 py-6 border-b border-gray-100 backdrop-blur-md bg-white/80 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-[#1a2b4b]">Account Settings</h2>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Profile & Configuration</p>
                </div>
            </div>

            <div className="flex-1 p-8 space-y-10 max-w-4xl">
                {/* Profile Section */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16"></div>
                    
                    <div className="flex items-center gap-6 relative">
                        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100 uppercase">
                            {profile?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-[#1a2b4b]">{profile?.name}</h3>
                            <p className="text-sm font-medium text-gray-400">Organization: <span className="text-blue-600 uppercase tracking-tighter font-bold">{profile?.organizationName || "Your Company"}</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
                            <input 
                                disabled
                                value={profile?.email || ""}
                                className="w-full bg-slate-50 border border-transparent px-5 py-4 rounded-2xl outline-none font-medium text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Role</label>
                            <input 
                                disabled
                                value={profile?.role || "Member"}
                                className="w-full bg-slate-50 border border-transparent px-5 py-4 rounded-2xl outline-none font-medium text-slate-500 cursor-not-allowed uppercase text-[10px] tracking-widest"
                            />
                        </div>
                    </div>
                </section>

                {/* API & Security Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 md:col-span-2">
                        <h4 className="text-lg font-black text-[#1a2b4b]">Security & Password</h4>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">Regularly updating your password and monitoring account activity ensures your organization's security.</p>
                        
                        <div className="pt-4">
                            <button className="bg-slate-900 text-white font-black text-xs px-8 py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95">
                                Change Password Request
                            </button>
                        </div>
                    </section>

                    <section className="bg-blue-600 p-8 rounded-[2.5rem] border border-blue-500 shadow-xl shadow-blue-100 space-y-6 text-white text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🔑</div>
                        <div>
                            <h4 className="text-lg font-black">API Access</h4>
                            <p className="text-xs text-blue-100 mt-2 font-medium opacity-80 leading-relaxed">Coming soon: Connect your AI chatbots with your internal systems through our API.</p>
                        </div>
                    </section>
                </div>

                {/* Danger Zone */}
                <section className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100 space-y-4">
                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Danger Zone</h4>
                    <p className="text-xs text-red-900/60 font-medium">Permanently delete your account and all associated chatbot data. This action is irreversible.</p>
                    <button className="text-xs font-black text-red-600 hover:bg-red-100 px-6 py-3 rounded-xl transition-all border border-red-200">
                        Request Account Deletion
                    </button>
                </section>

                 <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest pb-10">
                    Configuration ID: {profile?.userId || "ID_UNAVAILABLE"}
                </p>
            </div>
        </main>
    );
}
