import { useState, useEffect, useCallback } from "react";

interface StreakData {
  streak: number;
  lastDate: string | null;
}

export function useStreak() {
    const [streak, setStreak] = useState<number>(0);
    
    const getToday = useCallback(() => {
        return new Date().toISOString().split('T')[0]; // e.g. "2025-10-12"
    }, []);

    const loadStreak = useCallback(() => {
        const data = JSON.parse(localStorage.getItem("streakData") || "null") || {
            streak: 0,
            lastDate: null,
        };

        if (data.lastDate) {
            const last = new Date(data.lastDate);
            const today = new Date(getToday());
            const diffDays = (today.getTime() - last.getTime()) / (100 * 60 * 60 * 24);

            if (diffDays > 1) {
                data.streak = 0; // missed a day → reset streak
            }

        }

        setStreak(data.streak);
        return data;
    }, [getToday]);

    const saveStreak = useCallback((data: StreakData) => {
        localStorage.setItem("streakData", JSON.stringify(data));
    }, []);
    
    const incrementStreak = useCallback(() => {
        const data = loadStreak();
        const today = getToday();

        if (data.lastDate !== today) {
            data.streak += 1;
            data.lastDate = today;
            saveStreak(data);
            setStreak(data.streak);
        }

    }, [getToday, loadStreak, saveStreak]);

    useEffect(() => {
        loadStreak();
    }, [loadStreak]);

    return { 
        streak, 
        incrementStreak 
    };
}