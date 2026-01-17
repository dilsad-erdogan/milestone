"use client";

import { useEffect, useState } from "react";
import { Languages, Globe, Plus, ArrowLeft } from "lucide-react";
import { getAllCategories } from "../../firebase/categories";
import { addWord, getWordById } from "../../firebase/words";
import { addWordToUser, getUserWords } from "../../firebase/accounts";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";


function WordCard({ word }: { word: any }) {
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

export default function MyWordsPage() {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [userWords, setUserWords] = useState<any[]>([]);
    const [loadingWords, setLoadingWords] = useState(true);

    // Form states
    const [engWord, setEngWord] = useState("");
    const [trWord, setTrWord] = useState("");
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    const { user } = useAuth();

    // Kullanıcının kelimelerini çek
    const fetchUserWords = async () => {
        if (!user) return;
        setLoadingWords(true);
        try {
            const wordIds = await getUserWords(user.uid);
            console.log("User word IDs:", wordIds);

            const wordsPromises = wordIds.map((id: string) => getWordById(id));
            const wordsData = await Promise.all(wordsPromises);

            // Null olmayanları filtrele (silinmiş olabilir)
            setUserWords(wordsData.filter(w => w !== null));
        } catch (error) {
            console.error("Error fetching user words:", error);
        } finally {
            setLoadingWords(false);
        }
    };

    // Kategorileri çek
    useEffect(() => {
        const fetchCategories = async () => {
            if (!user) return;
            try {
                const cats = await getAllCategories();
                setCategories(cats);
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };

        if (user) {
            fetchCategories();
            fetchUserWords();
        }
    }, [user]);

    const handleSave = async () => {
        if (!engWord || !trWord) {
            alert("Lütfen her iki kelimeyi de giriniz.");
            return;
        }

        setLoading(true);
        try {
            const engChar = engWord.charAt(0).toUpperCase();
            const trChar = trWord.charAt(0).toLocaleUpperCase('tr-TR');

            if (categories.length === 0) {
                alert("Kategoriler yüklenemedi. Lütfen sayfayı yenileyin.");
                setLoading(false);
                return;
            }

            const findCategory = (char: string) => {
                return categories.find(c =>
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
                eng: engWord,
                tr: trWord,
                eng_categoryId: engId,
                tr_categoryId: trId
            };

            const newWord = await addWord(wordData);

            if (user && user.uid) {
                await addWordToUser(user.uid, newWord.id);
            }

            alert("Kelime başarıyla eklendi!");
            setEngWord("");
            setTrWord("");
            setView('list'); // Listeye dön
            fetchUserWords(); // Listeyi güncelle
        } catch (error) {
            console.error("Error saving word:", error);
            alert("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center p-4 pt-24">

                {view === 'list' && (
                    <div className="w-full max-w-4xl">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Kelimelerim</h1>
                                <p className="text-slate-500 mt-1">Öğrendiğin ve eklediğin tüm kelimeler burada.</p>
                            </div>
                            <button
                                onClick={() => setView('form')}
                                className="flex items-center gap-2 px-10 py-3 bg-[#3FB8F5] hover:bg-[#34a3da] text-white font-medium rounded-full transition-colors shadow-[0_4px_14px_0_rgba(63,184,245,0.39)] active:scale-95 transform duration-100 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-5 h-5" />
                                Yeni Kelime Ekle
                            </button>
                        </div>

                        {loadingWords ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : userWords.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {userWords.map((word) => (
                                    <WordCard key={word.id} word={word} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Languages className="w-8 h-8 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Henüz kelime eklemedin!</h3>
                                <p className="text-slate-500 mb-6">Kelime hazineni geliştirmek için hemen ilk kelimeni ekle.</p>
                                <button
                                    onClick={() => setView('form')}
                                    className="text-blue-600 font-medium hover:underline"
                                >
                                    Şimdi Ekle &rarr;
                                </button>
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
                            Listeye Dön
                        </button>

                        <h1 className="text-3xl font-bold text-[#111827] mb-2">Yeni Kelime Ekle</h1>
                        <p className="text-gray-500 mb-8">Kelime hazineni genişletmek için yeni bir giriş yap.</p>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">

                            {/* İngilizce Kelime */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
                                    İNGİLİZCE KELİME
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Languages className="h-5 w-5 text-gray-300" />
                                    </div>
                                    <input
                                        type="text"
                                        value={engWord}
                                        onChange={(e) => setEngWord(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium"
                                        placeholder="Örn: Book"
                                    />
                                </div>
                            </div>

                            {/* Türkçe Karşılık */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
                                    TÜRKÇE KARŞILIĞI
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Globe className="h-5 w-5 text-gray-300" />
                                    </div>
                                    <input
                                        type="text"
                                        value={trWord}
                                        onChange={(e) => setTrWord(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-[#F9FAFB] border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium"
                                        placeholder="Örn: Kitap"
                                    />
                                </div>
                            </div>

                            {/* Kaydet Butonu */}
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full bg-[#3FB8F5] hover:bg-[#34a3da] text-white font-bold py-4 rounded-xl transition-colors shadow-[0_4px_14px_0_rgba(63,184,245,0.39)] active:scale-[0.98] transform duration-100 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? "KAYDEDİLİYOR..." : "KELİMEYİ KAYDET"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
