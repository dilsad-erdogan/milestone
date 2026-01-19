"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";

interface WordCardProps {
    word: any;
    onAdd?: (wordId: string) => void;
    isAdded?: boolean;
    primaryLanguage?: 'eng' | 'tr';
}

export default function WordCard({ word, onAdd, isAdded = false, primaryLanguage = 'eng' }: WordCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    // Determine content based on primary language
    const frontContent = primaryLanguage === 'eng' ? word.eng : word.tr;
    const backContent = primaryLanguage === 'eng' ? word.tr : word.eng;

    return (
        <div
            className="h-40 w-full perspective-1000 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* Ön Yüz */}
                <div className="absolute w-full h-full backface-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#3FB8F5]">{frontContent}</span>

                    {onAdd && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isAdded) onAdd(word.id);
                            }}
                            disabled={isAdded}
                            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${isAdded
                                ? "bg-green-100 text-green-600 cursor-default"
                                : "bg-blue-50 text-blue-500 hover:bg-blue-100 hover:scale-110 active:scale-95"
                                }`}
                        >
                            {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {/* Arka Yüz */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#3FB8F5] p-6 rounded-2xl shadow-sm border border-[#3FB8F5] flex items-center justify-center text-white">
                    <span className="text-xl font-bold">{backContent}</span>
                </div>
            </div>
        </div>
    );
}
