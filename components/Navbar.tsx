"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/firebase/auth";
import { PlusCircle, LogOut, BookOpen, Globe, Languages } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
    const { user, loading } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();

    const isQuizPage = pathname === '/quiz/eng-tr' || pathname === '/quiz/tr-eng';

    if (loading || !user) return null;

    const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (isQuizPage) {
            const confirmLeave = window.confirm(t.quiz.exitWarning);
            if (!confirmLeave) {
                e.preventDefault();
                return;
            }
        }
    };

    const handleLogout = async () => {
        if (isQuizPage) {
            const confirmLeave = window.confirm(t.quiz.exitWarning);
            if (!confirmLeave) return;
        }
        try {
            await logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const toggleLanguage = () => {
        setLanguage(language === 'eng' ? 'tr' : 'eng');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo / Home Link */}
                    <Link
                        href="/"
                        onClick={(e) => handleNavigation(e, '/')}
                        className="flex items-center gap-2 group"
                    >
                        <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
                            <Languages className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                            Milestone.
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link
                            href="/pool"
                            onClick={(e) => handleNavigation(e, '/pool')}
                            className="flex items-center justify-center gap-2 px-4 h-10 text-sm font-semibold text-slate-600 hover:text-[#3FB8F5] hover:bg-[#3FB8F5]/20 rounded-full transition-all active:scale-95"
                        >
                            <div className="p-1"> <BookOpen className="h-4 w-4" /> </div>
                            <span className="hidden sm:inline pt-[2px]">{t.navbar.pool}</span>
                        </Link>

                        <Link
                            href="/add-word"
                            onClick={(e) => handleNavigation(e, '/add-word')}
                            className="flex items-center justify-center gap-2 px-4 h-10 text-sm font-semibold text-slate-600 hover:text-[#3FB8F5] hover:bg-[#3FB8F5]/20 rounded-full transition-all active:scale-95"
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span className="hidden sm:inline pt-[2px]">{t.navbar.myWords}</span>
                        </Link>

                        <button
                            onClick={toggleLanguage}
                            disabled={isQuizPage}
                            className={`flex items-center justify-center gap-2 px-4 h-10 text-sm font-semibold rounded-full transition-all active:scale-95 ${isQuizPage ? 'opacity-50 cursor-not-allowed text-slate-400 bg-gray-50' : 'text-slate-600 hover:text-[#3FB8F5] hover:bg-[#3FB8F5]/20'}`}
                            title={isQuizPage ? t.quiz.exitWarning : ""}
                        >
                            <Globe className="h-4 w-4" />
                            <span className="hidden sm:inline pt-[2px]">{language === 'eng' ? 'TR' : 'EN'}</span>
                        </button>

                        <div className="h-6 w-[1px] bg-gray-200 hidden sm:block"></div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 px-4 h-10 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all active:scale-95"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline pt-[2px]">{t.navbar.logout}</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
