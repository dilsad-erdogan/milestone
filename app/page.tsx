"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { getUserQuizStats } from "@/firebase/quizzes";
import { getUserAccount } from "@/firebase/accounts";
import { BookOpen, Trophy, Activity, ClipboardList, ListTodo, Star } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalScore: 0,
    totalQuestionsSolved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        try {
          const [quizStats, accountData] = await Promise.all([
            getUserQuizStats(user.uid),
            getUserAccount(user.uid)
          ]);

          setStats({
            ...quizStats,
            totalScore: accountData?.score || 0
          });
        } catch (error) {
          console.error("Error loading stats:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStats();
  }, [user]);

  const StatCard = ({ icon: Icon, title, value, iconColor, bgColor }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-full mb-3 ${bgColor}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F9FAFB] p-8 pt-24">
        <div className="max-w-5xl mx-auto">

          <header className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {t.home.welcome} <span className="text-[#3FB8F5]">{user?.displayName || "Kullanıcı"}</span>!
              </h1>
              <p className="text-slate-500 mt-2">
                {t.home.welcomeSubtitle}
              </p>
            </div>
            <button
              onClick={() => router.push('/quiz/history')}
              className="px-6 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-blue-500" />
              {t.quiz.history}
            </button>
          </header>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3FB8F5]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12 text-black">
              <StatCard
                icon={Trophy}
                title={t.home.bestScore}
                value={stats.bestScore}
                iconColor="text-yellow-500"
                bgColor="bg-yellow-50"
              />
              <StatCard
                icon={Star}
                title={t.home.totalScore}
                value={stats.totalScore}
                iconColor="text-orange-500"
                bgColor="bg-orange-50"
              />
              <StatCard
                icon={Activity}
                title={t.home.averageScore}
                value={`%${stats.averageScore}`}
                iconColor="text-green-500"
                bgColor="bg-green-50"
              />
              <StatCard
                icon={ClipboardList}
                title={t.home.totalQuizzes}
                value={stats.totalQuizzes}
                iconColor="text-[#3FB8F5]"
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={ListTodo}
                title={t.home.questionsSolved}
                value={stats.totalQuestionsSolved}
                iconColor="text-purple-500"
                bgColor="bg-purple-50"
              />
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center py-16">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
              <BookOpen className="w-8 h-8 text-[#3FB8F5]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t.home.startQuizTitle}</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              {t.home.startQuizDesc}
            </p>
            <button
              onClick={() => router.push('/quiz')}
              className="px-8 py-3 bg-[#3FB8F5] hover:bg-[#34a3da] text-white font-medium rounded-full transition-colors shadow-lg shadow-blue-200"
            >
              {t.home.startQuizButton}
            </button>
          </div>

        </div>
      </div>
    </AuthGuard >
  );
}
