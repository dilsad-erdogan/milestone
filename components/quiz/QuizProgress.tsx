"use client";

import { cn } from "@/utils/cn"; // Ensure you have a cn utility or use template literals

interface QuizProgressProps {
    letters: string[];
    currentLetter: string;
    answeredLetters: Record<string, 'correct' | 'wrong' | 'empty' | 'locked'>;
    onLetterClick?: (letter: string) => void;
}

export default function QuizProgress({ letters, currentLetter, answeredLetters, onLetterClick }: QuizProgressProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x">
            {letters.map((letter) => {
                const status = answeredLetters[letter];
                const isCurrent = letter === currentLetter;
                const isLocked = status === 'locked';

                let bgClass = "bg-white border-slate-200 text-slate-500 hover:border-blue-300";

                if (status === 'correct') bgClass = "bg-[#43C000] border-[#43C000] text-white";
                else if (status === 'wrong') bgClass = "bg-[#FF4B4B] border-[#FF4B4B] text-white";
                else if (status === 'empty') bgClass = "bg-[#FFC800] border-[#FFC800] text-white";
                else if (isLocked) bgClass = "bg-[#7D7D7D] border-[#7D7D7D] text-white opacity-40 cursor-not-allowed";
                else if (isCurrent) bgClass = "bg-[#3FB8F5] border-[#3FB8F5] text-white shadow-md scale-110";

                return (
                    <div
                        key={letter}
                        onClick={() => !isLocked && onLetterClick && onLetterClick(letter)}
                        className={`
                            ${bgClass}
                            w-10 h-10 min-w-[2.5rem] rounded-full flex items-center justify-center 
                            font-bold text-sm transition-all duration-200 border-2
                            snap-center
                            ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        {letter}
                    </div>
                );
            })}
        </div>
    );
}
