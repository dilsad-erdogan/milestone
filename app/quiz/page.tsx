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
    const [selectedRandomMode, setSelectedRandomMode] = useState<{ source: 'my-words' | 'all-words', direction: 'eng-tr' | 'tr-eng' } | null>(null);
    const [questionCount, setQuestionCount] = useState<number>(10);

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

    const handleClassicSelect = (direction: 'eng-tr' | 'tr-eng') => {
        if (!hasWords) {
            alert(t.quiz.notEnoughWords);
            return;
        }
        router.push(`/quiz/${direction}`);
    };

    const handleRandomSelect = (source: 'my-words' | 'all-words', direction: 'eng-tr' | 'tr-eng') => {
        if (source === 'my-words' && !hasWords) {
            alert(t.quiz.notEnoughWords);
            return;
        }
        setSelectedRandomMode({ source, direction });
    };

    const startRandomQuiz = () => {
        if (!selectedRandomMode) return;
        const { source, direction } = selectedRandomMode;
        router.push(`/quiz/${direction}?mode=random&source=${source}&count=${questionCount}`);
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
            <div className={`min-h-screen bg-[#F9FAFB] flex flex-col items-center p-4 pt-24 ${selectedRandomMode ? 'overflow-hidden h-screen' : ''}`}>
                <div className="w-full max-w-4xl">
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

                    {/* Classic Options */}
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">🅰️</span>
                            {t.quiz.classic}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* English -> Turkish */}
                            <button
                                onClick={() => handleClassicSelect('eng-tr')}
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
                                onClick={() => handleClassicSelect('tr-eng')}
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

                    {/* Random Options */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">🎲</span>
                            {t.quiz.random}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* My Words Random */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                        <span className="text-2xl">📚</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{t.navbar.myWords}</h3>
                                        <p className="text-slate-400 text-xs">{t.quiz.randomMyWordsDesc}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleRandomSelect('my-words', 'eng-tr')}
                                        className="py-3 px-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all font-medium text-slate-600 text-sm"
                                    >
                                        🇬🇧 ENG → 🇹🇷 TR
                                    </button>
                                    <button
                                        onClick={() => handleRandomSelect('my-words', 'tr-eng')}
                                        className="py-3 px-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all font-medium text-slate-600 text-sm"
                                    >
                                        🇹🇷 TR → 🇬🇧 ENG
                                    </button>
                                </div>
                            </div>

                            {/* All Words Random */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                                        <span className="text-2xl">🌍</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{t.quiz.allWords}</h3>
                                        <p className="text-slate-400 text-xs">{t.quiz.randomAllWordsDesc}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleRandomSelect('all-words', 'eng-tr')}
                                        className="py-3 px-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all font-medium text-slate-600 text-sm"
                                    >
                                        🇬🇧 ENG → 🇹🇷 TR
                                    </button>
                                    <button
                                        onClick={() => handleRandomSelect('all-words', 'tr-eng')}
                                        className="py-3 px-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all font-medium text-slate-600 text-sm"
                                    >
                                        🇹🇷 TR → 🇬🇧 ENG
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Count Modal */}
                {selectedRandomMode && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                            <h3 className="text-2xl font-bold text-center text-slate-900 mb-2">
                                {t.quiz.selectQuestionCount}
                            </h3>
                            <p className="text-center text-slate-500 mb-8">
                                {selectedRandomMode.source === 'all-words' ? t.quiz.allWords : t.navbar.myWords} • {selectedRandomMode.direction === 'eng-tr' ? 'English → Turkish' : 'Turkish → English'}
                            </p>

                            <div className="grid grid-cols-4 gap-3 mb-8">
                                {[10, 20, 30, 50].map(count => (
                                    <button
                                        key={count}
                                        onClick={() => setQuestionCount(count)}
                                        className={`py-4 rounded-xl font-bold text-lg transition-all ${questionCount === count
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                    >
                                        {count}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSelectedRandomMode(null)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    {t.common.cancel}
                                </button>
                                <button
                                    onClick={startRandomQuiz}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                                >
                                    {t.quiz.startRandomQuiz}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
