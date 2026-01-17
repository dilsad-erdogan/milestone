"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/firebase/auth";
import { PlusCircle, LogOut, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading || !user) return null;

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo / Home Link */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                            Milestone.
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/add-word"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#3FB8F5] hover:bg-[#3FB8F5]/20 rounded-full transition-all active:scale-95"
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Kelimelerim</span>
                        </Link>

                        <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all active:scale-95"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Çıkış Yap</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
