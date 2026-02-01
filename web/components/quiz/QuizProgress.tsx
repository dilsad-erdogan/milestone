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
        <div className="w-full overflow-x-auto pb-6 pt-2 px-2 scrollbar-hide">
            <div className="flex gap-3 mx-auto w-fit min-w-full justify-center md:justify-start">
                {letters.map((letter) => {
                    const status = answeredLetters[letter];
                    const isCurrent = letter === currentLetter;
                    const isLocked = status === 'locked';

                    let bgClass = "bg-white border-2 border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-500 shadow-sm";

                    if (status === 'correct') bgClass = "bg-[#43C000] border-[#43C000] text-white shadow-md shadow-green-200";
                    else if (status === 'wrong') bgClass = "bg-[#FF4B4B] border-[#FF4B4B] text-white shadow-md shadow-red-200";
                    else if (status === 'empty') bgClass = "bg-amber-400 border-amber-400 text-white shadow-md shadow-amber-200";
                    // Locked is ideally hidden now, but if it happens:
                    else if (isLocked) bgClass = "bg-slate-100 border-slate-100 text-slate-300 opacity-50 cursor-not-allowed";

                    if (isCurrent) {
                        bgClass = "bg-[#3FB8F5] border-[#3FB8F5] text-white shadow-lg shadow-blue-300 scale-110 z-10 ring-4 ring-blue-100";
                    }

                    return (
                        <button
                            key={letter}
                            onClick={() => !isLocked && onLetterClick && onLetterClick(letter)}
                            className={`
                                ${bgClass}
                                w-14 h-14 min-w-[3.5rem] rounded-2xl flex items-center justify-center 
                                text-lg font-black transition-all duration-300 ease-out
                                ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                            `}
                        >
                            {letter}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
