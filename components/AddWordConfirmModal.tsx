"use client";

import { X, AlertTriangle, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface AddWordConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    word: { eng: string; tr: string } | null;
}

export default function AddWordConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    word
}: AddWordConfirmModalProps) {
    const { t, language } = useLanguage();

    if (!isOpen || !word) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
                    {language === 'tr' ? 'Kelimenin doğruluğunu onaylıyor musunuz?' : 'Confirm word accuracy?'}
                </h2>

                {/* Word Display */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">English</span>
                        <span className="text-lg font-bold text-slate-800">{word.eng}</span>
                    </div>
                    <div className="h-px bg-slate-200 mb-3"></div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Türkçe</span>
                        <span className="text-lg font-bold text-slate-800">{word.tr}</span>
                    </div>
                </div>

                {/* Warning Text */}
                <p className="text-sm text-slate-500 text-center mb-8">
                    {language === 'tr'
                        ? 'Bu kelime başka bir kullanıcı tarafından eklenmiştir. Doğruluğunu kontrol ettikten sonra listeye ekleyebilirsiniz.'
                        : 'This word was added by another user. Please verify its accuracy before adding to your list.'}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                        {language === 'tr' ? 'İptal' : 'Cancel'}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-6 py-3 bg-[#3FB8F5] text-white rounded-xl font-bold hover:bg-[#34a3da] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                    >
                        <Check className="w-5 h-5" />
                        {language === 'tr' ? 'Onaylıyorum' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}
