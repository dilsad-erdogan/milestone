"use client";

import { useEffect, useState } from "react";
import { getAllWords } from "../../firebase/words";
import { getUserWords, addWordToUser } from "../../firebase/accounts";
import { useAuth } from "@/context/AuthContext";
import WordCard from "@/components/WordCard";
import AuthGuard from "@/components/AuthGuard";
import { BookOpen, Layers } from "lucide-react";

export default function PoolPage() {
    const [words, setWords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userWordIds, setUserWordIds] = useState<Set<string>>(new Set());
    const [addingId, setAddingId] = useState<string | null>(null);

    const { user } = useAuth();

    // Verileri çek
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [allWords, userWords] = await Promise.all([
                    getAllWords(),
                    getUserWords(user.uid)
                ]);

                // Filter valid words
                setWords(allWords.filter((w: any) => w.eng && w.tr));

                // Store user's word IDs in a Set for O(1) lookup
                setUserWordIds(new Set(userWords));
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleAddToMyWords = async (wordId: string) => {
        if (!user || addingId) return;

        setAddingId(wordId);
        try {
            await addWordToUser(user.uid, wordId);

            // Update local state immediately
            setUserWordIds(prev => {
                const newSet = new Set(prev);
                newSet.add(wordId);
                return newSet;
            });

            // Optional: Show a toast? 
            // For now the button state change is enough feedback
        } catch (error) {
            console.error("Error adding word:", error);
            alert("Kelime eklenirken bir hata oluştu.");
        } finally {
            setAddingId(null);
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center p-4 pt-24">
                <div className="w-full max-w-4xl">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Kelime Havuzu</h1>
                            <p className="text-slate-500 mt-1">Platformdaki tüm kelimeleri keşfet ve listene ekle.</p>
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
                                <WordCard
                                    key={word.id}
                                    word={word}
                                    onAdd={handleAddToMyWords}
                                    isAdded={userWordIds.has(word.id)}
                                />
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
