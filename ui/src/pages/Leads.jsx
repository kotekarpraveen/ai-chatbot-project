import { useState, useEffect } from "react";
import api from "../api";

export default function Leads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchLeads = async () => {
        try {
            const res = await api.get("/leads");
            setLeads(res.data);
        } catch (error) {
            console.error("Failed to fetch leads", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const filteredLeads = leads.filter(lead => 
        (lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white md:rounded-l-[3rem]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <main className="flex-1 flex flex-col h-full bg-slate-50 md:rounded-l-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 backdrop-blur-md bg-white/80 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-[#1a2b4b]">Lead Central</h2>
                    <p className="text-xs text-gray-500 tracking-wide uppercase font-medium">All potential customers captured by AI</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search leads..." 
                            className="bg-slate-100 border-none rounded-xl px-10 py-2.5 text-sm focus:ring-2 ring-blue-100 transition-all outline-none md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chatbot</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Captured</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 uppercase tracking-tight">
                                {filteredLeads.map((lead, i) => (
                                    <tr key={lead.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-xs font-black text-blue-600 shadow-sm">
                                                    {lead.name?.charAt(0) || "U"}
                                                </div>
                                                <span className="text-sm font-bold text-[#1a2b4b]">{lead.name || "Unknown"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-gray-500 font-medium">{lead.email}</td>
                                        <td className="px-8 py-5 text-sm text-gray-400">{lead.phone || "-"}</td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                                                {lead.chatbot_name || 'Generic Bot'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs text-gray-400 font-medium text-right lowercase">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {filteredLeads.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-gray-400 text-sm italic">No leads found matching your search.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
