"use client";

import { useEffect, useState } from "react";
import { getAllWords } from "../../firebase/words";
import { getAllCategories } from "../../firebase/categories";
import { getUserWords, addWordToUser } from "../../firebase/accounts";
import { useAuth } from "@/context/AuthContext";
import WordCard from "@/components/WordCard";
import AuthGuard from "@/components/AuthGuard";
import { BookOpen, Layers } from "lucide-react";

export default function PoolPage() {
    const [words, setWords] = useState<any[]>([]);
    const [filteredWords, setFilteredWords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userWordIds, setUserWordIds] = useState<Set<string>>(new Set());
    const [addingId, setAddingId] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [languageMode, setLanguageMode] = useState<'eng' | 'tr'>('eng');

    const { user } = useAuth();

    // Verileri çek
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [allWords, userWords, allCategories] = await Promise.all([
                    getAllWords(),
                    getUserWords(user.uid),
                    getAllCategories()
                ]);

                // Filter valid words
                setWords(allWords.filter((w: any) => w.eng && w.tr));
                setCategories(allCategories.sort((a: any, b: any) => a.name.localeCompare(b.name)));

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

    // Filtering and Sorting Effect
    useEffect(() => {
        let result = [...words];

        // Filter by Category
        if (selectedCategory) {
            result = result.filter(word =>
                (languageMode === 'eng' ? word.eng_categoryId : word.tr_categoryId) === selectedCategory
            );
        }

        // Sort
        result.sort((a, b) => {
            const valA = (languageMode === 'eng' ? a.eng : a.tr).toLowerCase();
            const valB = (languageMode === 'eng' ? b.eng : b.tr).toLowerCase();

            if (sortOrder === 'asc') {
                return valA.localeCompare(valB, languageMode === 'tr' ? 'tr' : 'en');
            } else {
                return valB.localeCompare(valA, languageMode === 'tr' ? 'tr' : 'en');
            }
        });

        setFilteredWords(result);
    }, [words, selectedCategory, sortOrder, languageMode]);

    const handleAddToMyWords = async (wordId: string) => {
        // ... (existing logic)
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
                <div className="w-full max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Kelime Havuzu</h1>
                            <p className="text-slate-500 mt-1">Platformdaki tüm kelimeleri keşfet ve listene ekle.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setLanguageMode(prev => prev === 'eng' ? 'tr' : 'eng')}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <span className="text-xs font-bold text-slate-400">DİL</span>
                                {languageMode === 'eng' ? 'İngilizce' : 'Türkçe'}
                            </button>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <span className="text-xs font-bold text-slate-400">SIRALA</span>
                                {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                            </button>
                            <div className="bg-blue-50 p-3 rounded-full hidden md:block">
                                <Layers className="w-6 h-6 text-[#3FB8F5]" />
                            </div>
                        </div>
                    </div>

                    {/* Category Filter */}
                    {!loading && categories.length > 0 && (
                        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                            <div className="flex gap-2 min-w-min">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === null
                                        ? "bg-[#3FB8F5] text-white shadow-md shadow-blue-200"
                                        : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-blue-500"
                                        }`}
                                >
                                    Tümü
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center transition-all flex-shrink-0 ${selectedCategory === cat.id
                                            ? "bg-[#3FB8F5] text-white shadow-md shadow-blue-200"
                                            : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-blue-500"
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3FB8F5]"></div>
                        </div>
                    ) : filteredWords.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredWords.map((word) => (
                                <WordCard
                                    key={word.id}
                                    word={word}
                                    onAdd={handleAddToMyWords}
                                    isAdded={userWordIds.has(word.id)}
                                    primaryLanguage={languageMode}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {selectedCategory
                                    ? `${categories.find(c => c.id === selectedCategory)?.name || selectedCategory} kategorisinde kelime yok!`
                                    : "Havuz Boş!"}
                            </h3>
                            <p className="text-slate-500 mb-6">
                                {selectedCategory ? "Başka bir kategori seçmeyi dene." : "Henüz hiç kelime eklenmemiş."}
                            </p>
                            {selectedCategory && (
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="text-blue-600 font-medium hover:underline"
                                >
                                    Tümünü Göster
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
