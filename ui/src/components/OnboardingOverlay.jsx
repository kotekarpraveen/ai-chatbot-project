import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OnboardingOverlay({ chatbotsCount }) {
    const [step, setStep] = useState(1);
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
        if (!hasSeenOnboarding && chatbotsCount === 0) {
            setIsVisible(true);
        }
    }, [chatbotsCount]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("hasSeenOnboarding", "true");
    };

    if (!isVisible) return null;

    const steps = [
        {
            title: "Create Your First Chatbot",
            description: "Start by giving your AI assistant a name and a purpose.",
            action: "Got it, let's go!",
            position: "top-20 right-20"
        },
        {
            title: "Train Your Bot",
            description: "Upload PDFs or provide website URLs to build your knowledge base.",
            action: "Next step",
            position: "top-40 right-40"
        },
        {
            title: "Go Live!",
            description: "Simply copy the embed code and paste it on your website.",
            action: "Ready to launch!",
            position: "bottom-20 left-20"
        }
    ];

    const currentStep = steps[step - 1];

    return (
        <div className="fixed inset-0 z-[100] bg-[#1a2b4b]/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden p-10 space-y-8 animate-in zoom-in-95 duration-500">
                {/* Progress Dots */}
                <div className="flex gap-2 justify-center mb-4">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i + 1 ? 'w-8 bg-blue-600' : 'w-2 bg-gray-100'}`}></div>
                    ))}
                </div>

                <div className="space-y-4 text-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-lg shadow-blue-100 mb-6">
                        {step === 1 ? "🤖" : step === 2 ? "📚" : "🚀"}
                    </div>
                    <h3 className="text-2xl font-black text-[#1a2b4b] leading-tight">{currentStep.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{currentStep.description}</p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <button
                        onClick={() => {
                            if (step < 3) setStep(step + 1);
                            else handleDismiss();
                        }}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        {currentStep.action}
                    </button>
                    <button 
                        onClick={handleDismiss}
                        className="w-full text-gray-400 font-bold text-xs uppercase tracking-widest py-2 hover:text-gray-600 transition-colors"
                    >
                        Skip Onboarding
                    </button>
                </div>

                <button 
                    onClick={handleDismiss}
                    className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
