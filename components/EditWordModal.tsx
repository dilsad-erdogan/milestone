"use client";

import { useLanguage } from "@/context/LanguageContext";
import { X, Save, Languages, Globe } from "lucide-react";
import { useState, useEffect } from "react";

interface EditWordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (eng: string, tr: string) => Promise<void>;
    initialEng: string;
    initialTr: string;
}

export default function EditWordModal({ isOpen, onClose, onSave, initialEng, initialTr }: EditWordModalProps) {
    const { t } = useLanguage();
    const [eng, setEng] = useState(initialEng);
    const [tr, setTr] = useState(initialTr);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setEng(initialEng);
            setTr(initialTr);
        }
    }, [isOpen, initialEng, initialTr]);

    const handleSave = async () => {
        if (!eng.trim() || !tr.trim()) return;
        setLoading(true);
        try {
            await onSave(eng, tr);
            onClose();
        } catch (error) {
            console.error("Error updating word:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                        {t.myWords.editTitle || "Kelimeyi Düzenle"}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 mb-8">
                    {/* ENG Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">
                            {t.myWords.engWordLabel}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Languages className="h-5 w-5 text-gray-300" />
                            </div>
                            <input
                                type="text"
                                value={eng}
                                onChange={(e) => setEng(e.target.value.toLocaleUpperCase('tr-TR'))}
                                className="block w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            />
                        </div>
                    </div>

                    {/* TR Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">
                            {t.myWords.trWordLabel}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Globe className="h-5 w-5 text-gray-300" />
                            </div>
                            <input
                                type="text"
                                value={tr}
                                onChange={(e) => setTr(e.target.value.toLocaleUpperCase('tr-TR'))}
                                className="block w-full pl-12 pr-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {t.common.cancel || "İptal"}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 py-3 bg-[#3FB8F5] text-white rounded-xl font-bold hover:bg-[#329fd6] transition-colors shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {t.common.save || "Kaydet"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
