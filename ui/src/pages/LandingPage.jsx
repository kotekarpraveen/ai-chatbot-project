import React, { Suspense, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera } from "@react-three/drei";
import { 
  Bot, Rocket, Shield, BarChart2, Globe, MessageSquare, 
  Zap, Users, Laptop, Check, ChevronRight, Play, Menu, X,
  Briefcase, GraduationCap, Building2, Stethoscope, ShoppingBag
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- 3D Components ---
const FloatingObject = () => (
  <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
    <Sphere args={[1, 100, 100]} scale={1.8}>
      <MeshDistortMaterial
        color="#3b82f6"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
      />
    </Sphere>
  </Float>
);

const Scene = () => (
  <>
    <PerspectiveCamera makeDefault position={[0, 0, 8]} />
    <ambientLight intensity={0.5} />
    <pointLight position={[10, 10, 10]} intensity={1.5} />
    <spotLight position={[-10, 10, 0]} angle={0.2} penumbra={1} intensity={1} />
    <FloatingObject />
    <mesh position={[2, -1, -2]} scale={0.5}>
        <octahedronGeometry />
        <meshStandardMaterial color="#8b5cf6" wireframe />
    </mesh>
    <mesh position={[-3, 2, -1]} scale={0.4}>
        <icosahedronGeometry />
        <meshStandardMaterial color="#ec4899" wireframe />
    </mesh>
  </>
);

// --- UI Components ---
const Nav = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "Demo", href: "#demo" },
        { name: "Pricing", href: "#pricing" },
        { name: "Use Cases", href: "#usecases" },
    ];

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
            scrolled ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm" : "bg-transparent"
        )}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                        Y
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">YourAIChatbot</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <a key={link.name} href={link.href} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-blue-600 px-4 py-2">
                        Login
                    </Link>
                    <Link to="/signup" className="text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition-all shadow-xl shadow-gray-200">
                        Start Free
                    </Link>
                    <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 md:hidden flex flex-col gap-4 animate-in slide-in-from-top duration-300">
                    {navLinks.map(link => (
                        <a key={link.name} href={link.href} onClick={() => setMobileOpen(false)} className="text-lg font-bold text-slate-600 py-2 border-b border-gray-50">
                            {link.name}
                        </a>
                    ))}
                    <Link to="/login" className="w-full text-center py-4 text-slate-600 font-bold border-b border-gray-50">Login</Link>
                    <Link to="/signup" className="w-full text-center py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100">Get Started</Link>
                </div>
            )}
        </nav>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        viewport={{ once: true }}
        className="bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
    >
        <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform group-hover:bg-blue-600 group-hover:text-white">
            <Icon size={28} />
        </div>
        <h4 className="text-xl font-black text-slate-900 mb-3">{title}</h4>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
);

const StepCard = ({ number, title, desc, icon: Icon }) => (
    <div className="relative flex flex-col items-center text-center p-6 group">
        <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl border border-gray-100 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform relative z-10">
            <Icon size={32} />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                {number}
            </div>
        </div>
        <h4 className="text-lg font-black text-slate-900 mb-2">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">{desc}</p>
    </div>
);

const PriceCard = ({ plan, price, features, highlighted }) => (
    <div className={cn(
        "p-10 rounded-[3rem] transition-all duration-500 flex flex-col",
        highlighted 
            ? "bg-slate-900 text-white shadow-2xl shadow-blue-200 md:scale-105 z-10" 
            : "bg-white text-slate-900 border border-gray-100 shadow-xl"
    )}>
        <div className="mb-8">
            <h4 className="text-xl font-black uppercase tracking-widest text-blue-500 mb-2">{plan}</h4>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">{price}</span>
                <span className={highlighted ? "text-slate-400" : "text-slate-500"}>/mo</span>
            </div>
        </div>
        <ul className="space-y-4 mb-10 flex-1">
            {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", highlighted ? "bg-blue-500/20 text-blue-500" : "bg-blue-50 text-blue-600")}>
                        <Check size={12} strokeWidth={4} />
                    </div>
                    <span className={cn("text-sm font-medium", highlighted ? "text-slate-300" : "text-slate-600")}>{f}</span>
                </li>
            ))}
        </ul>
        <Link 
            to="/signup" 
            className={cn(
                "py-4 rounded-2xl text-center font-black text-sm transition-all",
                highlighted ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"
            )}
        >
            Start Free Trial
        </Link>
    </div>
);

// --- Main Page ---
export default function LandingPage() {
    return (
        <div className="min-h-screen w-full bg-[#f8fbff] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-600 overflow-x-hidden">
            <Nav />

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-[90vh] flex flex-col justify-center px-6 pt-20">
                <div className="absolute inset-0 z-0 opacity-40 overflow-hidden pointer-events-none">
                    <Canvas>
                        <Suspense fallback={null}>
                            <Scene />
                        </Suspense>
                    </Canvas>
                </div>

                <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-2 items-center gap-12 py-12 md:py-24">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter">
                            <Zap size={14} /> New: AI Visual Training is live
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tight">
                            Build Your <br />
                            <span className="text-blue-600">24/7 Sales</span> <br /> 
                            Assistant.
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl leading-relaxed">
                            Turn your website into a lead-generating machine. Train AI chatbots on 
                            your documents and automate growth while you sleep.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link to="/signup" className="group bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black hover:bg-black transition-all shadow-2xl shadow-gray-300 flex items-center gap-2">
                                Start Free <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button 
                                onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
                                className="bg-white border-2 border-gray-100 px-10 py-5 rounded-[1.5rem] font-black hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                                View Demo <Play size={16} fill="currentColor" />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-6 pt-8 border-t border-gray-100">
                            {[
                                { val: "10k+", label: "Chats monthly" },
                                { val: "50+", label: "Lead forms" },
                                { val: "24/7", label: "Automation" }
                            ].map(stat => (
                                <div key={stat.label}>
                                    <p className="text-2xl font-black text-slate-900">{stat.val}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        {/* Mockup UI */}
                        <div className="relative bg-white/40 backdrop-blur-3xl p-4 rounded-[4rem] border border-white shadow-2xl rotate-3 hover:rotate-0 transition-all duration-700">
                            <div className="bg-slate-900 rounded-[3rem] p-8 aspect-[4/5] relative overflow-hidden flex flex-col text-white">
                                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">🤖</div>
                                        <div>
                                            <p className="text-white font-bold text-sm">YourAI AI</p>
                                            <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest">Online</p>
                                        </div>
                                    </div>
                                    <X className="text-white/40" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                                        <p className="text-white text-xs leading-relaxed">Hello! I've studied your documentation. How can I help you grow today?</p>
                                    </div>
                                    <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none ml-auto max-w-[70%]">
                                        <p className="text-white text-xs">How do I capture leads?</p>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                                        <p className="text-white text-xs leading-relaxed">I automatically detect intent. When a user asks for pricing, I'll capture their contact info! 🚀</p>
                                    </div>
                                </div>
                                <div className="mt-auto h-12 bg-white/5 rounded-2xl flex items-center px-4 border border-white/5 text-white/30 text-xs font-medium">
                                    Type your question...
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="py-20 md:py-32 px-6 bg-slate-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 md:mb-20 space-y-4">
                        <h2 className="text-sm font-black text-blue-600 tracking-[0.2em] uppercase">The Simple Process</h2>
                        <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Three steps to AI Excellence.</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                        <StepCard 
                            number="01" 
                            title="Create Your Bot" 
                            desc="Choose a name and personality that fits your brand perfectly." 
                            icon={Bot} 
                        />
                         <StepCard 
                            number="02" 
                            title="Train with Data" 
                            desc="Upload PDFs or simply paste your website URL. We index in seconds." 
                            icon={Laptop} 
                        />
                         <StepCard 
                            number="03" 
                            title="Go Live" 
                            desc="Copy one line of code to your site and start generating leads." 
                            icon={Globe} 
                        />
                    </div>
                </div>
            </section>

            {/* --- LIVE DEMO SECTION --- */}
            {/* --- REDESIGNED LIVE DEMO SECTION --- */}
            <section id="demo" className="py-24 md:py-40 px-6 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-7xl mx-auto relative">
                    <div className="bg-slate-900 rounded-[4rem] p-10 md:p-24 overflow-hidden relative shadow-3xl shadow-blue-900/40 border border-white/5">
                        {/* Internal Decorative Elements */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 to-transparent blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
                        
                        <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                                        Live Experience
                                    </div>
                                    <h3 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                                        Experience the <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Future of Support.</span>
                                    </h3>
                                    <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-lg font-medium">
                                        Our AI doesn't just chat; it understands your business. Interaction leads to 
                                        trust, and trust leads to conversion. See it in action.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px bg-blue-500/30 flex-1"></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Interactive Scenarios</span>
                                        <div className="h-px bg-blue-500/30 flex-1"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { q: "What services do you offer?", icon: "💼" },
                                            { q: "How can I contact you?", icon: "📩" },
                                            { q: "Show me your pricing", icon: "💰" },
                                            { q: "Tell me about AI training", icon: "🧠" }
                                        ].map(item => (
                                            <button 
                                                key={item.q} 
                                                className="group text-left p-5 bg-white/5 border border-white/10 rounded-3xl text-white text-sm hover:bg-white/10 hover:border-blue-500/50 transition-all font-semibold flex items-center gap-4 hover:-translate-y-1"
                                            >
                                                <span className="text-xl group-hover:scale-125 transition-transform">{item.icon}</span>
                                                <span className="opacity-80 group-hover:opacity-100 italic">"{item.q}"</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="pt-4">
                                    <Link to="/signup" className="text-blue-400 font-bold text-sm hover:underline flex items-center gap-2 group">
                                        Ready to create your own? Get started for free 
                                        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            <div className="relative group/mockup">
                                {/* Floating Glow */}
                                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] items-center justify-center flex opacity-0 group-hover/mockup:opacity-100 transition-opacity duration-1000"></div>
                                
                                {/* Device Mockup Layout */}
                                <div className="relative bg-[#0b1426] rounded-[3.5rem] p-3 shadow-[0_0_80px_rgba(37,99,235,0.2)] border border-white/10 transform transition-all duration-700 hover:scale-[1.02]">
                                    <div className="bg-white rounded-[2.8rem] overflow-hidden shadow-inner h-[550px] md:h-[650px] relative">
                                        <iframe 
                                            src="/demo?chatbotId=d0809080-acca-4314-bb6b-b659d8374937&embedded=true" 
                                            className="w-full h-full border-0 relative z-10"
                                            title="Chatbot Demo"
                                        ></iframe>
                                    </div>
                                    
                                    {/* Mockup Decorations */}
                                    <div className="absolute top-1/2 -right-4 w-1.5 h-16 bg-white/10 rounded-l-md blur-[1px]"></div>
                                    <div className="absolute top-1/4 -right-4 w-1.5 h-12 bg-white/10 rounded-l-md blur-[1px]"></div>
                                </div>

                                {/* Floating Stat Chips */}
                                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-3xl shadow-2xl border border-blue-50 animate-in zoom-in duration-1000 hidden md:block z-20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">⚡</div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Response Time</p>
                                            <p className="text-sm font-black text-slate-900">{"< 1.2s"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -top-6 -right-6 bg-slate-900 p-4 rounded-3xl shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-1000 hidden md:block z-20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">99%</div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase leading-none mb-1">Accuracy Rate</p>
                                            <p className="text-sm font-black text-white italic">RAG Indexed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section id="features" className="py-20 md:py-32 px-6 relative">
                 <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-8 text-center md:text-left">
                        <div className="space-y-4">
                            <h2 className="text-sm font-black text-blue-600 tracking-[0.2em] uppercase">Capabilities</h2>
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Everything you need <br /> to scale fast.</h3>
                        </div>
                        <p className="text-slate-500 max-w-sm font-medium">Built for modern SaaS teams, ecommerce owners, and clinics.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <FeatureCard 
                            icon={Database} 
                            title="RAG-Powered AI" 
                            desc="No more generic answers. Our AI is trained specifically on your business data for 100% accuracy." 
                            delay={0}
                        />
                        <FeatureCard 
                            icon={BarChart2} 
                            title="Smart Analytics" 
                            desc="Identify high-intent visitors and monitor conversation trends in real-time through our dashboard." 
                            delay={0.1}
                        />
                        <FeatureCard 
                            icon={Users} 
                            title="Lead Automation" 
                            desc="Detect sales intent and capture contact information automatically into your dashboard." 
                            delay={0.2}
                        />
                        <FeatureCard 
                            icon={Building2} 
                            title="Multi-Project" 
                            desc="Manage multiple chatbots for different websites under a single high-performance organization." 
                            delay={0.3}
                        />
                        <FeatureCard 
                            icon={Shield} 
                            title="Enterprise Security" 
                            desc="Bank-grade encryption for all your business data and customer conversations." 
                            delay={0.4}
                        />
                        <FeatureCard 
                            icon={MessageSquare} 
                            title="Omnichannel" 
                            desc="Coming Soon: Integrate with WhatsApp, Telegram, and Messenger in one click." 
                            delay={0.5}
                        />
                    </div>
                </div>
            </section>

             {/* --- USE CASES --- */}
             <section id="usecases" className="py-20 md:py-32 px-6 bg-slate-900 overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 w-full h-full bg-blue-600/10 blur-[150px] -translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <h3 className="text-3xl md:text-5xl font-black text-white text-center mb-16 md:mb-20 tracking-tight text-white leading-tight">Built for your industry.</h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { title: "Ecommerce", icon: ShoppingBag, desc: "Handle product inquiries and track orders." },
                            { title: "Real Estate", icon: Building2, desc: "Qualify house hunters and book viewings." },
                            { title: "Healthcare", icon: Stethoscope, desc: "Assist patients and capture appointment leads." },
                            { title: "Education", icon: GraduationCap, desc: "Answer course questions and enroll students." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] hover:bg-white/10 transition-all text-center group">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all">
                                    <item.icon size={28} />
                                </div>
                                <h4 className="text-white font-bold text-base md:text-lg mb-2">{item.title}</h4>
                                <p className="text-slate-400 text-[10px] md:text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
             </section>

            {/* --- PRICING SECTION --- */}
            <section id="pricing" className="py-20 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 md:mb-20 space-y-4">
                        <h2 className="text-sm font-black text-blue-600 tracking-[0.2em] uppercase">Pricing</h2>
                        <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Invest in your growth.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-8">
                        <PriceCard 
                            plan="Starter" 
                            price="₹2,000" 
                            features={["1 AI Chatbot", "1,000 Messages/mo", "5 Knowledge Sources", "Basic Analytics", "Community Support"]}
                        />
                        <PriceCard 
                            plan="Pro" 
                            price="₹5,000" 
                            highlighted={true}
                            features={["5 AI Chatbots", "10,000 Messages/mo", "20 Knowledge Sources", "Advanced Analytics", "Lead Exporting", "Priority Support"]}
                        />
                        <PriceCard 
                            plan="Enterprise" 
                            price="Custom" 
                            features={["Unlimited Chatbots", "Custom Message Volumes", "Unlimited Sources", "API Access", "Dedicated Success Manager", "SLA Guarantee"]}
                        />
                    </div>
                </div>
            </section>

             {/* --- FINAL CTA --- */}
             <section className="py-12 md:py-20 px-4 md:px-6">
                 <div className="max-w-5xl mx-auto bg-blue-600 rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-24 text-center space-y-8 relative overflow-hidden shadow-3xl shadow-blue-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="relative z-10 space-y-6 md:space-y-8 text-white">
                        <h3 className="text-3xl md:text-6xl font-black leading-tight tracking-tight">Start your AI <br /> chatbot today.</h3>
                        <p className="text-blue-100 text-base md:text-lg font-medium max-w-lg mx-auto leading-relaxed opacity-90">
                            Join 500+ businesses automating their growth. <br />
                            Get started for free. No credit card required.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/signup" className="w-full sm:w-auto bg-white text-blue-600 px-12 py-5 rounded-[1.5rem] font-black hover:scale-105 transition-all shadow-xl">
                                Create My Bot
                            </Link>
                            <Link to="/demo" className="w-full sm:w-auto bg-blue-700 text-white px-12 py-5 rounded-[1.5rem] font-black hover:bg-blue-800 transition-all">
                                Book Demo
                            </Link>
                        </div>
                    </div>
                 </div>
             </section>

             {/* --- FOOTER --- */}
             <footer className="bg-slate-50 pt-24 pb-12 px-6 border-t border-gray-100 mt-20">
                 <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                     <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">Y</div>
                            <span className="text-lg font-black text-slate-900 tracking-tight">YourAIChatbot</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Enabling businesses to convert traffic into leads through high-performance 
                            AI assistants and RAG-based knowledge indexing.
                        </p>
                     </div>
                     {[
                         { title: "Product", links: ["Features", "Pricing", "Demo", "Showcase"] }
                     ].map(group => (
                         <div key={group.title} className="space-y-6">
                             <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{group.title}</h4>
                             <ul className="space-y-3">
                                 {group.links.map(l => (
                                     <li key={l}>
                                         <a href="#" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">{l}</a>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     ))}
                 </div>
                 <div className="max-w-7xl mx-auto pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                     <p>© 2026 YourAIChatbot AI SaaS. All rights reserved.</p>
                     <div className="flex gap-6">
                         <a href="#" className="hover:text-slate-900">Privacy Policy</a>
                         <a href="#" className="hover:text-slate-900">Terms of Service</a>
                     </div>
                 </div>
             </footer>
        </div>
    );
}

// Custom Database icon
const Database = ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
);
