import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ showInfo, setShowInfo }) => {
    const location = useLocation();

    const menuItems = [
        {
            name: "Chat Interface",
            path: "/",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            )
        },
        {
            name: "Admin Dashboard",
            path: "/admin",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 00-1.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            name: "Analytics",
            path: "/analytics",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10m14 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14m-7 0h14" />
                </svg>
            )
        }
    ];

    return (
        <>
            {/* Sidebar Overlay for Mobile */}
            {showInfo && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setShowInfo(false)}
                ></div>
            )}

            <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 p-8 flex flex-col gap-8 overflow-y-auto transition-transform duration-300 shadow-xl md:shadow-sm md:static md:w-80 md:translate-x-0
        ${showInfo ? "translate-x-0" : "-translate-x-full"}
      `}>
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
                            D
                        </div>
                        <h1 className="text-2xl font-extrabold text-[#1a2b4b] tracking-tight">DocuMind AI</h1>
                    </Link>
                    <button
                        onClick={() => setShowInfo(false)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-400"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-2 mb-4">Main Menu</p>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-semibold ${location.pathname === item.path
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                    : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                }`}
                            onClick={() => setShowInfo(false)}
                        >
                            {item.icon}
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <section className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-50 space-y-3">
                    <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Platform Status</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">All Systems Normal</p>
                    </div>
                </section>

                <p className="text-[10px] text-gray-400 text-center uppercase tracking-[0.2em] font-bold opacity-30">
                    v2.1.0 Cloud Enterprise
                </p>
            </aside>
        </>
    );
};

export default Sidebar;
