"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import AuthGuard from "@/components/AuthGuard";
import { getQuizResultById } from "@/firebase/quizzes";
import { Check, X, Clock, Target, Home, RotateCcw, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

export default function QuizResultPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const resultId = params.quizId as string;

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        const fetchResult = async () => {
            if (!resultId) return;
            try {
                const data = await getQuizResultById(resultId);
                if (data) {
                    setResult(data);
                }
            } catch (error) {
                console.error("Error fetching result:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [resultId]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F9FAFB]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Sonuç bulunamadı</h2>
                    <button onClick={() => router.push('/')} className="bg-blue-500 text-white px-6 py-2 rounded-xl">
                        {t.quiz.backHome}
                    </button>
                </div>
            </div>
        );
    }

    const accuracy = Math.round((result.correctAnswers / result.totalQuestions) * 100) || 0;

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#F9FAFB] pb-20">
                {/* Top Summary Header */}
                <div className="bg-white border-b border-slate-200 pt-32 pb-12 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-500 text-xs font-bold uppercase tracking-wider mb-4">
                            {t.quiz.result}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
                            {t.quiz.completed}
                        </h1>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-blue-100 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative text-7xl md:text-8xl font-black text-[#3FB8F5]">
                                    {result.finalScore}
                                </div>
                                <div className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">
                                    {t.quiz.score}
                                </div>
                            </div>

                            <div className="h-px w-24 md:w-px md:h-24 bg-slate-200"></div>

                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                <div className="text-left">
                                    <div className="flex items-center gap-2 text-[#43C000] mb-1">
                                        <Check className="w-5 h-5" />
                                        <span className="text-2xl font-black">{result.correctAnswers}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.quiz.correctAnswers}</div>
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2 text-[#FF4B4B] mb-1">
                                        <X className="w-5 h-5" />
                                        <span className="text-2xl font-black">{result.wrongAnswers}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.quiz.wrongAnswers}</div>
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Clock className="w-5 h-5" />
                                        <span className="text-2xl font-black">{Math.floor(result.timeTaken / 60)}:{String(result.timeTaken % 60).padStart(2, '0')}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.quiz.time}</div>
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2 text-orange-500 mb-1">
                                        <Target className="w-5 h-5" />
                                        <span className="text-2xl font-black">%{accuracy}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.quiz.accuracy}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <Home className="w-5 h-5" />
                                {t.quiz.backHome}
                            </button>
                            <button
                                onClick={() => router.push('/quiz')}
                                className="flex items-center gap-2 px-8 py-4 bg-[#3FB8F5] text-white rounded-2xl font-bold hover:bg-[#3FB8F5]/70 shadow-lg shadow-blue-200 transition-all active:scale-95"
                            >
                                <RotateCcw className="w-5 h-5" />
                                {t.quiz.tryAgain}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="max-w-4xl mx-auto px-4 mt-12">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <ChevronRight className="w-5 h-5 text-blue-500" />
                        {t.quiz.detailedResults}
                    </h3>

                    <div className="space-y-4">
                        {result.answers?.map((ans: any, idx: number) => {
                            if (ans.isLocked) return null;

                            return (
                                <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                                {ans.letter}
                                            </span>
                                            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t.quiz.question} {idx + 1}</div>
                                        </div>
                                        <div>
                                            {ans.status === 'correct' ? (
                                                <div className="flex items-center gap-1 text-[#43C000] text-xs font-black bg-green-50 px-3 py-1 rounded-full uppercase italic">
                                                    <Check className="w-4 h-4" /> {t.quiz.correct}
                                                </div>
                                            ) : ans.status === 'wrong' ? (
                                                <div className="flex items-center gap-1 text-[#FF4B4B] text-xs font-black bg-red-50 px-3 py-1 rounded-full uppercase italic">
                                                    <X className="w-4 h-4" /> {t.quiz.wrong}
                                                </div>
                                            ) : (
                                                <div className="text-[#FFC800] text-xs font-black bg-yellow-50 px-3 py-1 rounded-full uppercase italic">
                                                    {t.quiz.empty}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.quiz.question}</div>
                                            <div className="text-2xl font-black text-slate-800">{ans.question}</div>
                                        </div>
                                        <div className="flex gap-12">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.quiz.yourAnswerWas}</div>
                                                <div className={cn(
                                                    "text-xl font-bold",
                                                    ans.status === 'correct' ? 'text-[#43C000]' : ans.status === 'wrong' ? 'text-[#FF4B4B]' : 'text-[#FFC800] italic'
                                                )}>
                                                    {ans.userAnswer || t.quiz.empty}
                                                </div>
                                            </div>
                                            {ans.status !== 'correct' && (
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t.quiz.correctAnswer}</div>
                                                    <div className="text-xl font-bold text-blue-500">
                                                        {ans.correctAnswer}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
