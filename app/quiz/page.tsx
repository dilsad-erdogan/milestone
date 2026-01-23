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

    const startTotalQuiz = (direction: 'eng-tr' | 'tr-eng') => {
        if (!hasWords) {
            alert(t.quiz.notEnoughWords);
            return;
        }
        // Count 9999 signals "All" effectively
        router.push(`/quiz/${direction}?mode=random&source=my-words&count=9999`);
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
                <div className="w-full max-w-5xl">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {t.quiz.backHome}
                    </button>

                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">{t.quiz.title}</h1>
                        <p className="text-slate-500 text-xl font-light">{t.quiz.selectDirection}</p>
                    </div>

                    {/* SECTION 1: CLASSIC & RANDOM */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

                        {/* BLOCK A: CLASSIC (A-Z) */}
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="text-9xl font-black text-slate-300">A</span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-2">{t.quiz.classic}</h3>
                            <p className="text-slate-500 mb-8 text-sm">A → Z ordered progression</p>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <button
                                    onClick={() => handleClassicSelect('eng-tr')}
                                    className="bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <SquareArrowDown className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    <span className="font-bold text-slate-700 group-hover:text-blue-700 text-sm">ENG → TR</span>
                                </button>
                                <button
                                    onClick={() => handleClassicSelect('tr-eng')}
                                    className="bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <SquareArrowUp className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    <span className="font-bold text-slate-700 group-hover:text-blue-700 text-sm">TR → ENG</span>
                                </button>
                            </div>
                        </div>

                        {/* BLOCK B: RANDOM (MY WORDS) */}
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="text-9xl">🎲</span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-2">{t.quiz.random}</h3>
                            <p className="text-slate-500 mb-8 text-sm">{t.quiz.randomMyWordsDesc}</p>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <button
                                    onClick={() => handleRandomSelect('my-words', 'eng-tr')}
                                    className="bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">🎲</span>
                                    <span className="font-bold text-slate-700 group-hover:text-purple-700 text-sm">ENG → TR</span>
                                </button>
                                <button
                                    onClick={() => handleRandomSelect('my-words', 'tr-eng')}
                                    className="bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">🎲</span>
                                    <span className="font-bold text-slate-700 group-hover:text-purple-700 text-sm">TR → ENG</span>
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* SECTION 2: TOTAL PRACTICE (ALL MY WORDS) */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3 border-b border-slate-200 pb-4">
                            <span className="bg-amber-100 text-amber-600 p-2 rounded-xl text-2xl">🏆</span>
                            {t.quiz.totalPractice}
                            <span className="text-sm font-normal text-slate-400 ml-auto hidden md:inline-block">
                                {t.quiz.totalPracticeDesc}
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* BLOCK C: TOTAL QUIZ (ALL MY WORDS) */}
                            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] p-10 shadow-lg relative overflow-hidden text-white col-span-1 lg:col-span-2">
                                <div className="absolute top-0 right-0 p-8 opacity-20">
                                    <span className="text-9xl">🏆</span>
                                </div>

                                <div className="relative z-10 max-w-xl">
                                    <h3 className="text-3xl font-bold mb-4">{t.quiz.totalPractice}</h3>
                                    <p className="text-amber-50 mb-8 text-lg font-medium opacity-90">
                                        {t.quiz.totalQuizPromo}
                                    </p>

                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => startTotalQuiz('eng-tr')}
                                            className="bg-white text-orange-600 hover:bg-orange-50 border-2 border-transparent py-4 px-8 rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-3"
                                        >
                                            <span>🇬🇧 ENG</span>
                                            <span className="opacity-30">→</span>
                                            <span>🇹🇷 TR</span>
                                        </button>
                                        <button
                                            onClick={() => startTotalQuiz('tr-eng')}
                                            className="bg-orange-700 text-white hover:bg-orange-800 border-2 border-orange-400/30 py-4 px-8 rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-3"
                                        >
                                            <span>🇹🇷 TR</span>
                                            <span className="opacity-50">→</span>
                                            <span>🇬🇧 ENG</span>
                                        </button>
                                    </div>
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

                            <div className="grid grid-cols-5 gap-3 mb-8">
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
                                <button
                                    onClick={() => setQuestionCount(9999)}
                                    className={`py-4 rounded-xl font-bold text-lg transition-all ${questionCount === 9999
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                >
                                    {t.quiz.all || "All"}
                                </button>
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
