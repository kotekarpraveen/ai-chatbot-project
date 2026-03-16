import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [orgName, setOrgName] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/auth/signup`, { name, email, password, orgName });
            localStorage.setItem("token", res.data.token);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Signup failed");
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center bg-gray-50 md:rounded-l-[3rem] shadow-2xl p-8">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
                <h2 className="text-3xl font-extrabold text-[#1a2b4b] text-center mb-6">Create Account</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-semibold">{error}</div>}
                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full bg-[#f8fbff] border-2 border-transparent focus:border-blue-100 rounded-xl px-4 py-3 outline-none transition-all shadow-inner text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Work Email</label>
                        <input
                            type="email"
                            className="w-full bg-[#f8fbff] border-2 border-transparent focus:border-blue-100 rounded-xl px-4 py-3 outline-none transition-all shadow-inner text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Organization Name</label>
                        <input
                            type="text"
                            className="w-full bg-[#f8fbff] border-2 border-transparent focus:border-blue-100 rounded-xl px-4 py-3 outline-none transition-all shadow-inner text-sm"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full bg-[#f8fbff] border-2 border-transparent focus:border-blue-100 rounded-xl px-4 py-3 outline-none transition-all shadow-inner text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 mt-4">
                        Sign Up
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}
