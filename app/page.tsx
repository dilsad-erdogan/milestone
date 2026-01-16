"use client";

import Image from "next/image";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/firebase/auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-white transition-colors duration-300">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-2xl text-center sm:text-left">
          <div className="relative mb-4">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 opacity-25 blur-xl transition-opacity"></div>
            <h1 className="relative text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900">
              Milestone.
            </h1>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-light">
              Welcome back, <span className="font-medium text-slate-900">{user?.displayName || "User"}</span>!
            </p>
            <p className="text-sm text-slate-500 font-light">
              {user?.email}
            </p>
          </div>

          <div className="flex gap-4 items-center flex-col sm:flex-row mt-4">
            <button
              onClick={() => logout()}
              className="rounded-full border border-solid border-transparent transition-all flex items-center justify-center bg-slate-900 text-white gap-2 hover:bg-slate-700 h-10 sm:h-12 px-8 text-sm sm:text-base font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
