export type TimerSession = {
    id: string;
    // type: "focus" | "short_break" | "long_break";
    type: "Focus" | "Break";
    duration: number;
    startedAt: Date;
    endedAt?: Date;
    completed: boolean;
}

export type StreakData = {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string; // "YYYY-MM-DD"
}

export type PomodoroStats = {
    totalSessionToday: number;
    totalFocusTime: number; // in minutes
}