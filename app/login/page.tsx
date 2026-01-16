"use client";

import { signInWithGoogle } from "@/firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user, router]);

    const handleLogin = async () => {
        try {
            setError("");
            await signInWithGoogle();
        } catch (err: any) {
            console.error("Login failed", err);
            setError("Failed to sign in. Please try again.");
        }
    };

    if (user) return null; // Prevent flash while redirecting

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-slate-500">
                        Sign in to continue to Milestone
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={handleLogin}
                        className="w-full relative flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all focus:ring-2 focus:ring-slate-200 focus:outline-none bg-white text-slate-700 font-medium h-12"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span>Continue with Google</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
