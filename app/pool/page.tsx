"use client";

import { useEffect, useState } from "react";
import { getAllWords } from "../../firebase/words";
import WordCard from "@/components/WordCard";
import AuthGuard from "@/components/AuthGuard";
import { BookOpen, Layers } from "lucide-react";

export default function PoolPage() {
    const [words, setWords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWords = async () => {
            try {
                const allWords: any[] = await getAllWords();
                // Filter out any potential invalid entries
                setWords(allWords.filter(w => w.eng && w.tr));
            } catch (error) {
                console.error("Error fetching words:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWords();
    }, []);

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center p-4 pt-24">
                <div className="w-full max-w-4xl">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Kelime Havuzu</h1>
                            <p className="text-slate-500 mt-1">Platformdaki tüm kelimeleri keşfet.</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <Layers className="w-6 h-6 text-[#3FB8F5]" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3FB8F5]"></div>
                        </div>
                    ) : words.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {words.map((word) => (
                                <WordCard key={word.id} word={word} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Havuz Boş!</h3>
                            <p className="text-slate-500 mb-6">Henüz hiç kelime eklenmemiş.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
