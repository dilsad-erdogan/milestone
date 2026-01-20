"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import AuthGuard from "@/components/AuthGuard";
import { ArrowLeft, SquareArrowDown, SquareArrowUp } from "lucide-react";
import { getUserWords } from "../../firebase/accounts";

export default function QuizPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [hasWords, setHasWords] = useState(false);

    useEffect(() => {
        const checkWords = async () => {
            if (!user) return;
            try {
                const wordIds = await getUserWords(user.uid);
                setHasWords(wordIds.length > 0);
            } catch (error) {
                console.error("Error checking words:", error);
            } finally {
                setLoading(false);
            }
        };

        checkWords();
    }, [user]);

    const handleDirectionSelect = (direction: 'eng-tr' | 'tr-eng') => {
        if (!hasWords) {
            alert(t.quiz.notEnoughWords);
            return;
        }
        router.push(`/quiz/${direction}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center p-4 pt-24">
                <div className="w-full max-w-2xl">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {t.quiz.backHome}
                    </button>

                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">{t.quiz.title}</h1>
                        <p className="text-slate-500 text-lg">{t.quiz.selectDirection}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* English -> Turkish */}
                        <button
                            onClick={() => handleDirectionSelect('eng-tr')}
                            className="group relative bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left"
                        >
                            <div className="w-14 h-14 bg-[#3FB8F5] rounded-2xl flex items-center justify-center mb-6 text-white group-hover:bg-[#3FB8F5]/30 group-hover:text-white transition-colors duration-300">
                                <SquareArrowDown className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#3FB8F5] transition-colors">
                                {t.quiz.engToTr}
                            </h3>
                            <p className="text-slate-400 text-sm">
                                English Questions → Turkish Answers
                            </p>
                        </button>

                        {/* Turkish -> English */}
                        <button
                            onClick={() => handleDirectionSelect('tr-eng')}
                            className="group relative bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left"
                        >
                            <div className="w-14 h-14 bg-[#3FB8F5] rounded-2xl flex items-center justify-center mb-6 text-white group-hover:bg-[#3FB8F5]/30 group-hover:text-white transition-colors duration-300">
                                <SquareArrowUp className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#3FB8F5] transition-colors">
                                {t.quiz.trToEng}
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Türkçe Sorular → İngilizce Cevaplar
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
