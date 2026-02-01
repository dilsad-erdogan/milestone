"use client";

import { useLanguage } from "@/context/LanguageContext";
import { X, Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    wordText: string;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, wordText }: DeleteConfirmModalProps) {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-end mb-2">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <Trash2 className="w-6 h-6 text-red-500" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {t.myWords.deleteTitle || "Kelimeyi Sil"}
                    </h3>

                    <p className="text-gray-500 mb-6">
                        <span className="font-bold text-gray-800">"{wordText}"</span> {t.myWords.deleteConfirm || "kelimesini listenizden silmek istediğinize emin misiniz?"}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            {t.common.cancel || "İptal"}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
                        >
                            {t.common.delete || "Sil"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
