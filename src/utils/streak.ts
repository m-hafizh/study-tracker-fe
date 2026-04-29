import type { StudySession } from "@/services/storage";

/**
 * Calculate the current daily streak from a list of study sessions.
 * A streak is the number of consecutive days (ending today or yesterday)
 * that have at least one study session.
 */
export function calculateStreak(sessions: StudySession[]): {
    currentStreak: number;
    longestStreak: number;
} {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Collect unique study dates as "YYYY-MM-DD" strings
    const dateSet = new Set(sessions.map((s) => s.date));

    // Helper: format Date → "YYYY-MM-DD"
    const fmt = (d: Date) => d.toISOString().split("T")[0];

    // Helper: subtract N days
    const subDays = (d: Date, n: number) => {
        const copy = new Date(d);
        copy.setDate(copy.getDate() - n);
        return copy;
    };

    const today = new Date();
    const todayStr = fmt(today);
    const yesterdayStr = fmt(subDays(today, 1));

    // Current streak: start counting from today (or yesterday if no session today yet)
    let current = 0;
    let startDate = today;

    if (dateSet.has(todayStr)) {
        startDate = today;
    } else if (dateSet.has(yesterdayStr)) {
        startDate = subDays(today, 1);
    } else {
        // Streak is broken
        return { currentStreak: 0, longestStreak: calcLongest(dateSet) };
    }

    let d = startDate;
    while (dateSet.has(fmt(d))) {
        current++;
        d = subDays(d, 1);
    }

    return { currentStreak: current, longestStreak: Math.max(current, calcLongest(dateSet)) };
}

/** Calculate the longest streak ever from a set of date strings */
function calcLongest(dateSet: Set<string>): number {
    if (dateSet.size === 0) return 0;

    const sorted = Array.from(dateSet).sort();
    let longest = 1;
    let run = 1;

    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diffMs = curr.getTime() - prev.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            run++;
            longest = Math.max(longest, run);
        } else if (diffDays > 1) {
            run = 1;
        }
        // diffDays === 0 means same day, skip
    }

    return longest;
}
