"use client";

import { useEffect, useState } from "react";
import LeaderboardTable from "./LeaderboardTable";
import { getGeneralLeaderboard } from "@/firebase/accounts";
import { getDailyLeaderboard } from "@/firebase/dailyQuiz";
import { useLanguage } from "@/context/LanguageContext";

export default function HomeLeaderboards() {
    const { t } = useLanguage();
    const [generalData, setGeneralData] = useState<any[]>([]);
    const [dailyData, setDailyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const [general, daily] = await Promise.all([
                    getGeneralLeaderboard(),
                    getDailyLeaderboard()
                ]);
                setGeneralData(general);
                setDailyData(daily);
            } catch (error) {
                console.error("Error fetching leaderboards:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboards();
    }, []);

    return (
        <div className="grid md:grid-cols-2 gap-6 mt-6 mb-12">
            <div className="h-full">
                <LeaderboardTable
                    title={t.leaderboard?.dailyTitle || "Daily Quiz Leaders"}
                    entries={dailyData}
                    type="daily"
                    loading={loading}
                />
            </div>
            <div className="h-full">
                <LeaderboardTable
                    title={t.leaderboard?.generalTitle || "Top Students"}
                    entries={generalData}
                    type="general"
                    loading={loading}
                />
            </div>
        </div>
    );
}
