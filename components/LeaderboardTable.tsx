"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Trophy, Clock, User } from "lucide-react";
import React from "react";

interface LeaderboardEntry {
    id: string;
    displayName: string;
    score: number;
    timeTaken?: number;
    photoURL?: string;
    rank?: number;
}

interface LeaderboardTableProps {
    title: string;
    entries: LeaderboardEntry[];
    type: 'general' | 'daily';
    loading: boolean;
}

export default function LeaderboardTable({ title, entries, type, loading }: LeaderboardTableProps) {
    const { t } = useLanguage();

    // Display all entries passed to the component (the limit is handled in the data fetching layer)
    const displayEntries = entries;

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${type === 'daily' ? 'bg-purple-100' : 'bg-yellow-100'}`}>
                    <Trophy className={`w-5 h-5 ${type === 'daily' ? 'text-purple-600' : 'text-yellow-600'}`} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            </div>

            {loading ? (
                <div className="flex-1 flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
                </div>
            ) : entries.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10 text-sm">
                    <Trophy className="w-8 h-8 mb-2 opacity-50" />
                    <p>{t.quiz.noHistory}</p>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden">
                    <div className="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white z-10 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="py-3 pl-2">#</th>
                                    <th className="py-3">{t.home.welcome}</th>
                                    <th className="py-3 text-right">{t.quiz.score}</th>
                                    {type === 'daily' ? <th className="py-3 text-right">{t.quiz.time}</th> : null}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
                                {displayEntries.map((entry, index) => (
                                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 pl-2 font-bold text-slate-400 w-10">
                                            {index + 1}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg select-none">
                                                    {getAvatarEmoji(entry.id)}
                                                </div>
                                                <span className="font-medium text-slate-800 truncate max-w-[120px]" title={entry.displayName}>
                                                    {entry.displayName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-right font-bold text-[#3FB8F5]">
                                            {entry.score}
                                        </td>
                                        {type === 'daily' ? (
                                            <td className="py-3 text-right font-mono text-xs text-slate-400">
                                                {formatTime(entry.timeTaken || 0)}
                                            </td>
                                        ) : null}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// Helper to get a deterministic emoji based on string ID
function getAvatarEmoji(id: string) {
    const emojis = ['🐼', '🐨', '🦊', '🐰', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦄', '🐝', '🐞', '🦋', '🐌', '🐢', '🐙', '🐬'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % emojis.length;
    return emojis[index];
}
