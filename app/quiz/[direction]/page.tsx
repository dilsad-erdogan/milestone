
import QuizPlayClient from "@/components/quiz/QuizPlayClient";

export function generateStaticParams() {
    return [
        { direction: 'eng-tr' },
        { direction: 'tr-eng' },
    ];
}

export default function QuizPlayPage() {
    return <QuizPlayClient />;
}
