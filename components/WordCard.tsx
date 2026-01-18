"use client";

import { useState } from "react";

export default function WordCard({ word }: { word: any }) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className="h-40 w-full perspective-1000 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* Ön Yüz - İngilizce */}
                <div className="absolute w-full h-full backface-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#3FB8F5]">{word.eng}</span>
                </div>

                {/* Arka Yüz - Türkçe */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#3FB8F5] p-6 rounded-2xl shadow-sm border border-[#3FB8F5] flex items-center justify-center text-white">
                    <span className="text-xl font-bold">{word.tr}</span>
                </div>
            </div>
        </div>
    );
}
