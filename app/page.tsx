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
          <div className="flex flex-col gap-2 mt-20 sm:mt-0">
            <p className="text-2xl sm:text-3xl text-slate-800 leading-relaxed font-bold">
              Hoş geldin, <span className="text-blue-600">{user?.displayName || "Kullanıcı"}</span>!
            </p>
            <p className="text-base text-slate-500 font-light">
              Bugün yeni kelimeler öğrenmeye hazır mısın?
            </p>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
