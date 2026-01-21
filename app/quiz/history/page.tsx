"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import AuthGuard from "@/components/AuthGuard";
import { getUserQuizResults } from "@/firebase/quizzes";
import { ChevronLeft, Calendar, Award, Target, ChevronRight } from "lucide-react";

export default function QuizHistoryPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        const fetchResults = async () => {
            if (!user) return;
            try {
                const data = await getUserQuizResults(user.uid);
                setResults(data);
            } catch (error) {
                console.error("Error fetching results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [user]);

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#F9FAFB] p-8 pt-24">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        {t.quiz.backHome}
                    </button>

                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">{t.quiz.history}</h1>
                            <p className="text-slate-500 mt-1">{t.quiz.historyDescription}</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map((res) => {
                                const accuracy = Math.round((res.correctAnswers / res.totalQuestions) * 100) || 0;
                                const dateStr = res.completedAt?.toDate()?.toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) || 'Bilinmiyor';

                                return (
                                    <div
                                        key={res.id}
                                        onClick={() => router.push(`/quiz/result?id=${res.id}`)}
                                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex flex-col items-center justify-center text-blue-500">
                                                <Award className="w-6 h-6 mb-1" />
                                                <span className="text-sm font-black">{res.finalScore}</span>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {dateStr}
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800">
                                                    {res.direction === 'eng-tr' ? t.quiz.engToTr : t.quiz.trToEng}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-12">
                                            <div className="hidden md:flex items-center gap-8">
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-slate-800">{res.totalQuestions}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.quiz.question}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-orange-500">%{accuracy}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.quiz.accuracy}</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-16 border border-dashed border-slate-200 text-center">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{t.quiz.noHistory}</h3>
                            <button
                                onClick={() => router.push('/quiz')}
                                className="text-blue-500 font-bold hover:underline"
                            >
                                {t.quiz.startQuiz} &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
