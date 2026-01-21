"use client";

import { useEffect, useState } from "react";
import { Languages, Globe, Plus, ArrowLeft, Trash2, Edit2, Check } from "lucide-react";
// Removed direct firebase imports
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import WordCard from "@/components/WordCard";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import EditWordModal from "@/components/EditWordModal";

import { useLanguage } from "@/context/LanguageContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchAppData, addUserWord, removeUserWord, updateUserWord } from "../../store/slices/appSlice";

export default function MyWordsPage() {
    // Redux
    const dispatch = useDispatch<AppDispatch>();
    const { userWords, categories, loading: reduxLoading, initialized } = useSelector((state: RootState) => state.app);

    const [view, setView] = useState<'list' | 'form'>('list');
    // Using Redux state instead of local userWords
    const [filteredWords, setFilteredWords] = useState<any[]>([]);

    // Modes
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedWord, setSelectedWord] = useState<any>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    // Form states
    const [engWord, setEngWord] = useState("");
    const [trWord, setTrWord] = useState("");
    const [loading, setLoading] = useState(false);
    // Categories from Redux
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [languageMode, setLanguageMode] = useState<'eng' | 'tr'>('eng'); // Local state for content language

    const { user } = useAuth();
    const { t } = useLanguage(); // Use 't' for UI labels

    // Init Data via Redux
    useEffect(() => {
        if (user && !initialized) {
            dispatch(fetchAppData(user.uid));
        }
    }, [user, initialized, dispatch]);

    // Filter and Sort Effect
    useEffect(() => {
        let result = [...userWords];

        // Filter by Category
        if (selectedCategory) {
            result = result.filter(word =>
                (languageMode === 'eng' ? word.eng_categoryId : word.tr_categoryId) === selectedCategory
            );
        }

        // Sort
        const collator = new Intl.Collator(languageMode === 'tr' ? 'tr-TR' : 'en-US');
        result.sort((a, b) => {
            const valA = (languageMode === 'eng' ? a.eng : a.tr).toLowerCase();
            const valB = (languageMode === 'eng' ? b.eng : b.tr).toLowerCase();

            if (sortOrder === 'asc') {
                return collator.compare(valA, valB);
            } else {
                return collator.compare(valB, valA);
            }
        });

        setFilteredWords(result);
    }, [userWords, selectedCategory, sortOrder, languageMode]);

    const handleSave = async () => {
        if (!engWord || !trWord) {
            alert(t.myWords.validationMessage);
            return;
        }

        setLoading(true);
        try {
            const engChar = engWord.charAt(0).toLocaleUpperCase('tr-TR');
            const trChar = trWord.charAt(0).toLocaleUpperCase('tr-TR');

            // Categories already loaded in Redux
            if (categories.length === 0) {
                // Should be loaded by now if initialized
            }

            const findCategory = (char: string) => {
                return categories.find((c: any) =>
                    c.id === char ||
                    c.name === char ||
                    (c.name && c.name.includes(char))
                );
            };

            const engCategory = findCategory(engChar);
            const trCategory = findCategory(trChar);

            const engId = engCategory ? engCategory.id : engChar;
            const trId = trCategory ? trCategory.id : trChar;

            const wordData = {
                eng: engWord.trim().toLocaleUpperCase('tr-TR'),
                tr: trWord.trim().toLocaleUpperCase('tr-TR'),
                eng_categoryId: engId,
                tr_categoryId: trId
            };

            if (user) {
                await dispatch(addUserWord({ userId: user.uid, wordData })).unwrap();
            }

            // alert(t.myWords.successMessage); // Removed as per request
            setEngWord("");
            setTrWord("");
            setView('list'); // Listeye dön
        } catch (error) {
            console.error("Error saving word:", error);
            alert(t.myWords.errorMessage);
        } finally {
            setLoading(false);
        }
    };


    // --- Mode Toggles ---
    const toggleDeleteMode = () => {
        setIsDeleting(!isDeleting);
        setIsEditing(false); // Exclusive
    };

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
        setIsDeleting(false); // Exclusive
    };

    // --- Actions ---
    const handleWordClick = (word: any) => {
        if (isDeleting) {
            setSelectedWord(word);
            setDeleteModalOpen(true);
        } else if (isEditing) {
            setSelectedWord(word);
            setEditModalOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!user || !selectedWord) return;
        try {
            await dispatch(removeUserWord({ userId: user.uid, wordId: selectedWord.id })).unwrap();
            setDeleteModalOpen(false);
            setSelectedWord(null);
        } catch (error) {
            console.error("Delete error:", error);
            alert("Silme işlemi başarısız.");
        }
    };

    const confirmEdit = async (newEng: string, newTr: string) => {
        if (!user || !selectedWord) return;
        try {
            const engChar = newEng.charAt(0).toLocaleUpperCase('tr-TR');
            const trChar = newTr.charAt(0).toLocaleUpperCase('tr-TR');

            const findCategory = (char: string) => {
                return categories.find((c: any) =>
                    c.id === char ||
                    c.name === char ||
                    (c.name && c.name.includes(char))
                );
            };

            const engCategory = findCategory(engChar);
            const trCategory = findCategory(trChar);

            const wordData = {
                eng: newEng.trim().toLocaleUpperCase('tr-TR'),
                tr: newTr.trim().toLocaleUpperCase('tr-TR'),
                eng_categoryId: engCategory ? engCategory.id : engChar,
                tr_categoryId: trCategory ? trCategory.id : trChar
            };

            await dispatch(updateUserWord({
                userId: user.uid,
                oldWordId: selectedWord.id,
                newWordData: wordData
            })).unwrap();

            setEditModalOpen(false);
            setSelectedWord(null);
            setIsEditing(false);
        } catch (error) {
            console.error("Edit error:", error);
            alert("Güncelleme başarısız.");
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center p-4 pt-24">

                <DeleteConfirmModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    wordText={selectedWord ? (languageMode === 'eng' ? selectedWord.eng : selectedWord.tr) : ""}
                />

                <EditWordModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onSave={confirmEdit}
                    initialEng={selectedWord?.eng || ""}
                    initialTr={selectedWord?.tr || ""}
                />

                {view === 'list' && (
                    <div className="w-full max-w-6xl">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{t.myWords.title}</h1>
                                <p className="text-slate-500 mt-1">{t.myWords.subtitle}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Delete Toggle */}
                                <button
                                    onClick={toggleDeleteMode}
                                    className={`
                                        flex items-center justify-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm active:scale-95
                                        ${isDeleting
                                            ? "bg-red-500 text-white shadow-red-200"
                                            : "bg-white text-slate-600 hover:text-red-500 border border-slate-200"}
                                    `}
                                >
                                    {isDeleting ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                    <span className="hidden sm:inline text-xs font-bold">{isDeleting ? (t.common.finish || "Bitir") : (t.common.delete || "Sil")}</span>
                                </button>

                                {/* Edit Toggle */}
                                <button
                                    onClick={toggleEditMode}
                                    className={`
                                        flex items-center justify-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm active:scale-95
                                        ${isEditing
                                            ? "bg-blue-500 text-white shadow-blue-200"
                                            : "bg-white text-slate-600 hover:text-blue-500 border border-slate-200"}
                                    `}
                                >
                                    {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                    <span className="hidden sm:inline text-xs font-bold">{isEditing ? (t.common.finish || "Bitir") : (t.common.edit || "Düzenle")}</span>
                                </button>

                                <div className="h-6 w-[1px] bg-gray-200 hidden sm:block mx-1"></div>

                                <button
                                    onClick={() => setLanguageMode(prev => prev === 'eng' ? 'tr' : 'eng')}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <span className="text-xs font-bold text-slate-400 hidden sm:inline">{t.common.lang}</span>
                                    {languageMode === 'eng' ? t.common.english : t.common.turkish}
                                </button>
                                <button
                                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <span className="text-xs font-bold text-slate-400 hidden sm:inline">{t.common.sort}</span>
                                    {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                                </button>
                                <button
                                    onClick={() => setView('form')}
                                    disabled={isDeleting || isEditing}
                                    className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-2 bg-[#3FB8F5] hover:bg-[#34a3da] text-white font-medium rounded-full transition-colors shadow-md active:scale-95 transform duration-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t.myWords.newWord}</span>
                                </button>
                            </div>
                        </div>


                        {/* Category Filter */}
                        {(!reduxLoading || initialized) && categories.length > 0 && userWords.length > 0 && (
                            <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
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
                                    {[...categories]
                                        .sort((a, b) => new Intl.Collator('tr-TR').compare(a.name, b.name))
                                        .map((cat: any) => (
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
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredWords.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredWords.map((word) => (
                                    <WordCard
                                        key={word.id}
                                        word={word}
                                        primaryLanguage={languageMode}
                                        isDeleting={isDeleting}
                                        isEditing={isEditing}
                                        onClick={() => handleWordClick(word)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Languages className="w-8 h-8 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    {selectedCategory
                                        ? `${categories.find(c => c.id === selectedCategory)?.name || selectedCategory} ${t.pool.emptyCategory}`
                                        : t.myWords.emptyList}
                                </h3>
                                <p className="text-slate-500 mb-6">
                                    {selectedCategory ? t.pool.tryCategory : t.myWords.emptyListDesc}
                                </p>
                                {selectedCategory ? (
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="text-blue-600 font-medium hover:underline"
                                    >
                                        {t.pool.showAll}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setView('form')}
                                        className="text-blue-600 font-medium hover:underline"
                                    >
                                        {t.myWords.addNow} &rarr;
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {view === 'form' && (
                    <div className="w-full max-w-[600px]">
                        <button
                            onClick={() => setView('list')}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            {t.myWords.backToList}
                        </button>

                        <h1 className="text-3xl font-bold text-[#111827] mb-2">{t.myWords.addNewTitle}</h1>
                        <p className="text-gray-500 mb-8">{t.myWords.addNewDesc}</p>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">

                            {/* İngilizce Kelime */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
                                    {t.myWords.engWordLabel}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Languages className="h-5 w-5 text-gray-300" />
                                    </div>
                                    <input
                                        type="text"
                                        value={engWord}
                                        onChange={(e) => setEngWord(e.target.value.toLocaleUpperCase('tr-TR'))}
                                        className="block w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium"
                                        placeholder={t.myWords.engWordPlaceholder}
                                    />
                                </div>
                            </div>

                            {/* Türkçe Karşılık */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
                                    {t.myWords.trWordLabel}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Globe className="h-5 w-5 text-gray-300" />
                                    </div>
                                    <input
                                        type="text"
                                        value={trWord}
                                        onChange={(e) => setTrWord(e.target.value.toLocaleUpperCase('tr-TR'))}
                                        className="block w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium"
                                        placeholder={t.myWords.trWordPlaceholder}
                                    />
                                </div>
                            </div>

                            {/* Kaydet Butonu */}
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full bg-[#3FB8F5] hover:bg-[#34a3da] text-white font-bold py-4 rounded-xl transition-colors shadow-[0_4px_14px_0_rgba(63,184,245,0.39)] active:scale-[0.98] transform duration-100 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? t.myWords.savingButton : t.myWords.saveButton}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
