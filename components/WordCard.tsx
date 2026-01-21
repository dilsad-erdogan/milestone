"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";

interface WordCardProps {
    word: any;
    onAdd?: (wordId: string) => void;
    isAdded?: boolean;
    primaryLanguage?: 'eng' | 'tr';
    onClick?: () => void;
    isDeleting?: boolean;
    isEditing?: boolean;
}

export default function WordCard({ word, onAdd, isAdded = false, primaryLanguage = 'eng', onClick, isDeleting, isEditing }: WordCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    // Determine content based on primary language
    const frontContent = primaryLanguage === 'eng' ? word.eng : word.tr;
    const backContent = primaryLanguage === 'eng' ? word.tr : word.eng;

    const handleClick = (e: React.MouseEvent) => {
        if (isDeleting || isEditing) {
            e.stopPropagation();
            if (onClick) onClick();
        } else {
            setIsFlipped(!isFlipped);
        }
    };

    return (
        <div
            className={`h-40 w-full perspective-1000 cursor-pointer transition-all duration-300 ${isDeleting ? 'hover:scale-95' : ''} ${isEditing ? 'hover:scale-95' : ''}`}
            onClick={handleClick}
        >
            <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped && !isDeleting && !isEditing ? 'rotate-y-180' : ''}`}>

                {/* Ön Yüz */}
                <div className={`
                    absolute w-full h-full backface-hidden bg-white p-6 rounded-2xl shadow-sm border 
                    flex items-center justify-center transition-all
                    ${isDeleting
                        ? 'border-red-400 bg-red-50 animate-[wiggle_1s_ease-in-out_infinite]'
                        : isEditing
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-100'}
                `}>
                    <span className={`text-xl font-bold ${isDeleting ? 'text-red-500' : 'text-[#3FB8F5]'}`}>
                        {frontContent}
                    </span>

                    {/* Mode Icons Overlay */}
                    {isDeleting && (
                        <div className="absolute top-2 right-2 bg-red-100 p-1.5 rounded-full">
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                    )}
                    {isEditing && (
                        <div className="absolute top-2 right-2 bg-blue-100 p-1.5 rounded-full">
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                    )}

                    {!isDeleting && !isEditing && onAdd && (
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
            <style jsx>{`
                @keyframes wiggle {
                    0%, 100% { transform: rotate(-3deg); }
                    50% { transform: rotate(3deg); }
                }
            `}</style>
        </div>
    );
}
