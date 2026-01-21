"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import WordCard from "@/components/WordCard";
import AuthGuard from "@/components/AuthGuard";
import { BookOpen, Layers } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchAppData, addUserWord } from "../../store/slices/appSlice";

export default function PoolPage() {
    // Redux
    const dispatch = useDispatch<AppDispatch>();
    const { words, categories, userWords, loading: reduxLoading, initialized } = useSelector((state: RootState) => state.app);

    const [filteredWords, setFilteredWords] = useState<any[]>([]);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [languageMode, setLanguageMode] = useState<'eng' | 'tr'>('eng');

    const { user } = useAuth();
    const { t } = useLanguage();

    // Fetch Data via Redux
    useEffect(() => {
        if (user && !initialized) {
            dispatch(fetchAppData(user.uid));
        }
    }, [user, initialized, dispatch]);

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
        if (!user || addingId) return;

        setAddingId(wordId);
        try {
            // Find the word object to add
            const wordToAdd = words.find(w => w.id === wordId);
            if (wordToAdd) {
                await dispatch(addUserWord({ userId: user.uid, wordData: wordToAdd })).unwrap();
            }
        } catch (error) {
            console.error("Error adding word:", error);
            alert("Kelime eklenirken bir hata oluştu.");
        } finally {
            setAddingId(null);
        }
    };

    // Check if word is added
    const isWordAdded = (id: string) => userWords.some(w => w.id === id);

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center p-4 pt-24">
                <div className="w-full max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{t.pool.title}</h1>
                            <p className="text-slate-500 mt-1">{t.pool.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setLanguageMode(prev => prev === 'eng' ? 'tr' : 'eng')}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <span className="text-xs font-bold text-slate-400">{t.common.lang}</span>
                                {languageMode === 'eng' ? t.common.english : t.common.turkish}
                            </button>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <span className="text-xs font-bold text-slate-400">{t.common.sort}</span>
                                {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                            </button>
                            <div className="bg-blue-50 p-3 rounded-full hidden md:block">
                                <Layers className="w-6 h-6 text-[#3FB8F5]" />
                            </div>
                        </div>
                    </div>

                    {/* Category Filter */}
                    {/* (!reduxLoading || initialized) check */}
                    {(initialized || !reduxLoading) && categories.length > 0 && (
                        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                            {/* ... existing code ... */}
                            <div className="flex gap-2 min-w-min">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === null
                                        ? "bg-[#3FB8F5] text-white shadow-md shadow-blue-200"
                                        : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-blue-500"
                                        }`}
                                >
                                    {t.pool.showAll}
                                </button>
                                {categories.map((cat: any) => (
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

                    {(!initialized && reduxLoading) ? (
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
                                    isAdded={isWordAdded(word.id)}
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
                                    ? `${categories.find(c => c.id === selectedCategory)?.name || selectedCategory} ${t.pool.emptyCategory}`
                                    : t.pool.emptyPool}
                            </h3>
                            <p className="text-slate-500 mb-6">
                                {selectedCategory ? t.pool.tryCategory : t.pool.emptyPoolDesc}
                            </p>
                            {selectedCategory && (
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="text-blue-600 font-medium hover:underline"
                                >
                                    {t.pool.showAll}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
