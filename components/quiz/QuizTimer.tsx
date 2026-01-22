"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface QuizTimerProps {
    initialTime: number; // in seconds
    onTimeUp: () => void;
    onTick?: (timeLeft: number) => void;
    isActive: boolean;
}

export default function QuizTimer({ initialTime, onTimeUp, onTick, isActive }: QuizTimerProps) {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    // useEffect(() => {
    //     // LocalStorage logic disabled to enforce fresh 5 min start
    //     const savedTime = localStorage.getItem('quiz_time_left');
    //     if (savedTime) {
    //         const parsedTime = parseInt(savedTime, 10);
    //         if (!isNaN(parsedTime) && parsedTime > 0) {
    //             setTimeLeft(parsedTime);
    //         }
    //     }
    // }, []);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onTimeUp();
                    return 0;
                }
                const newTime = prev - 1;
                // Keep saving for potential future use or debugging
                localStorage.setItem('quiz_time_left', newTime.toString());
                if (onTick) onTick(newTime);
                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, onTimeUp, onTick]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-full border border-slate-200 bg-slate-50 shadow-sm ${timeLeft < 60 ? 'text-red-500 animate-pulse bg-red-50 border-red-200' : 'text-slate-700'}`}>
            <Clock className="w-5 h-5" />
            <span>
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
}
