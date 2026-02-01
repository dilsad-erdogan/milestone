"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import QuizPlayClient from "@/components/quiz/QuizPlayClient";
import { getDailyQuiz, getUserDailyQuizStatus } from "@/firebase/dailyQuiz";

export default function DailyQuizPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [dailyWords, setDailyWords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [alreadyTaken, setAlreadyTaken] = useState(false);

    useEffect(() => {
        const initDailyQuiz = async () => {
            if (!user) return;

            try {
                // Check status first
                const taken = await getUserDailyQuizStatus(user.uid);
                if (taken) {
                    setAlreadyTaken(true);
                    setLoading(false);
                    return;
                }

                // Get Quiz
                const quiz: any = await getDailyQuiz();
                setDailyWords(quiz.words);
            } catch (error: any) {
                console.error(error);
                alert(`Günlük quiz yüklenirken hata oluştu: ${error.message}`);
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            initDailyQuiz();
        }
    }, [user, router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
    }

    if (alreadyTaken) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F9FAFB]">
                <h1 className="text-2xl font-bold">Günlük Quiz Tamamlandı!</h1>
                <p>Bugünün quizini zaten tamamladınız. Yarın tekrar bekleriz!</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                >
                    Ana Sayfaya Dön
                </button>
            </div>
        );
    }

    return (
        <QuizPlayClient
            mode="daily"
            overrideWords={dailyWords}
        />
    );
}
