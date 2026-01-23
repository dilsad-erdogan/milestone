
import { Suspense } from 'react';
import QuizPlayClient from "@/components/quiz/QuizPlayClient";

export function generateStaticParams() {
    return [
        { direction: 'eng-tr' },
        { direction: 'tr-eng' },
    ];
}

export default function QuizPlayPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <QuizPlayClient />
        </Suspense>
    );
}
