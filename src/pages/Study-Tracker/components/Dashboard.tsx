import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { getStudySummary, type StudySummary } from "@/api/analytics";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { calculateStreak } from "@/utils/streak";
import { LuFlame, LuTrophy, LuTarget } from "react-icons/lu";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Dashboard() {
    const navigate = useNavigate();
    const { sessions, load } = useHistoryStore();
    const [summary, setSummary] = useState<StudySummary | null>(null);

    useEffect(() => { load(); }, [load]);

    const today = new Date().toISOString().split("T")[0];
    const localTodayTotal = useMemo(() => {
        return sessions
            .filter(s => s.date === today)
            .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    }, [sessions, today]);

    const weekStart = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - d.getDay());
        return d.toISOString().split("T")[0];
    }, []);

    const localWeeklyTotal = useMemo(() => {
        return sessions
            .filter(s => s.date >= weekStart)
            .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    }, [sessions, weekStart]);

    const localStreak = useMemo(() => calculateStreak(sessions), [sessions]);

    const { dailyTargetMinutes, load: loadSettings, setDailyTarget } = useSettingsStore();
    useEffect(() => { loadSettings(); }, [loadSettings]);

    useEffect(() => {
        void (async () => {
            try {
                const response = await getStudySummary({ weekStart });
                setSummary(response);
            } catch {
                setSummary(null);
            }
        })();
    }, [weekStart, sessions.length, dailyTargetMinutes]);

    const todayTotal = summary?.todayMinutes ?? localTodayTotal;
    const weeklyTotal = summary?.weeklyMinutes ?? localWeeklyTotal;
    const streak = {
        currentStreak: summary?.currentStreakDays ?? localStreak.currentStreak,
        longestStreak: localStreak.longestStreak,
    };
    const targetForProgress = summary?.dailyTargetMinutes ?? dailyTargetMinutes;

    const progressPct = useMemo(() => {
        if (summary) return Math.round(summary.todayTargetProgress * 100);
        if (targetForProgress <= 0) return 0;
        return Math.min(100, Math.round((todayTotal / targetForProgress) * 100));
    }, [todayTotal, summary, targetForProgress]);

    const targetReached = progressPct >= 100;

    const localChartData = useMemo(() => {
        const byDate: Record<string, number> = {};
        sessions.forEach(s => {
            byDate[s.date] = (byDate[s.date] || 0) + (s.durationMinutes || 0);
        });
        return Object.entries(byDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-7)
            .map(([date, minutes]) => ({ date, minutes }));
    }, [sessions]);

    const chartData = summary?.dailyBreakdown ?? localChartData;

    return (
        <div className="space-y-5 max-w-5xl mx-auto pb-6 pt-2">
            {/* Reminder Banners */}
            {todayTotal === 0 && (
                <div className="flex items-center gap-3 rounded-full border border-orange-400/20 bg-orange-500/10 p-4 px-6 shadow-sm">
                    <LuFlame className="h-5 w-5 text-orange-500" />
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        You haven't studied today yet — keep your {streak.currentStreak > 0 ? `${streak.currentStreak}-day` : ""} streak alive! 🔥
                    </p>
                </div>
            )}
            {targetReached && (
                <div className="flex items-center gap-3 rounded-full border border-green-400/20 bg-green-500/10 p-4 px-6 shadow-sm">
                    <LuTrophy className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        🎉 You've hit your daily target of {dailyTargetMinutes} min! Great job!
                    </p>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Streak */}
                <Card className="vibe-card rounded-[2rem] bg-card transition-transform duration-300 hover:scale-[1.02]">
                    <CardContent className="flex flex-col items-center pt-6 pb-5 text-center">
                        <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
                            <span className="text-2xl">🔥</span>
                        </div>
                        <CardTitle className="text-2xl font-extrabold text-foreground">{streak.currentStreak}</CardTitle>
                        <CardDescription className="text-xs font-medium text-muted-foreground mt-1">Day Streak</CardDescription>
                        <div className="mt-3 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                            Best: {streak.longestStreak}
                        </div>
                    </CardContent>
                </Card>

                {/* Today */}
                <Card className="vibe-card rounded-[2rem] bg-card transition-transform duration-300 hover:scale-[1.02]">
                    <CardContent className="flex flex-col items-center pt-6 pb-5 text-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                            <span className="text-2xl">📅</span>
                        </div>
                        <CardTitle className="text-2xl font-extrabold text-foreground">{todayTotal}</CardTitle>
                        <CardDescription className="text-xs font-medium text-muted-foreground mt-1">Minutes Today</CardDescription>
                        <div className="mt-3 w-full px-2 space-y-2">
                            <Progress
                                value={progressPct}
                                className="h-2 rounded-full bg-muted"
                                indicatorClassName={cn(
                                    "transition-all duration-1000 rounded-full",
                                    targetReached ? "bg-emerald-500" : progressPct >= 50 ? "bg-teal-500" : "bg-amber-500"
                                )}
                            />
                            <p className="text-[10px] font-medium text-muted-foreground">{progressPct}% of {targetForProgress}m goal</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Weekly */}
                <Card className="vibe-card rounded-[2rem] bg-card transition-transform duration-300 hover:scale-[1.02]">
                    <CardContent className="flex flex-col items-center pt-6 pb-5 text-center">
                        <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                            <span className="text-2xl">📈</span>
                        </div>
                        <CardTitle className="text-2xl font-extrabold text-foreground">
                            {weeklyTotal}
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-muted-foreground mt-1">Minutes This Week</CardDescription>
                    </CardContent>
                </Card>

                {/* Daily Target */}
                <Card className="vibe-card rounded-[2rem] bg-card transition-transform duration-300 hover:scale-[1.02]">
                    <CardContent className="flex flex-col items-center pt-6 pb-5 text-center">
                        <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-3">
                            <LuTarget className="h-6 w-6 text-violet-500" />
                        </div>
                        <CardTitle className="text-base font-bold text-foreground mb-3">Daily Target</CardTitle>
                        <div className="flex items-center gap-2 bg-muted/50 rounded-full p-1.5 pl-4">
                            <Input
                                type="number"
                                min={5}
                                max={480}
                                step={5}
                                className="w-12 h-6 border-none bg-transparent shadow-none p-0 text-base font-bold text-center focus-visible:ring-0"
                                value={dailyTargetMinutes}
                                onChange={(e) => setDailyTarget(Number(e.target.value) || 60)}
                            />
                            <span className="text-xs font-medium text-muted-foreground pr-3">min</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <div className="vibe-card rounded-[2rem] bg-card p-6">
                <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground ml-2">Study Time <span className="text-muted-foreground font-medium text-xs ml-2">(Last 7 Days)</span></h2>
                <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="var(--border)" className="opacity-50" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(v) => v.slice(5)}
                                fontSize={12}
                                tickLine={true}
                                axisLine={{ stroke: "var(--border)" }}
                                stroke="var(--muted-foreground)"
                                tick={{ fill: 'var(--muted-foreground)' }}
                            />
                            <YAxis 
                                fontSize={12} 
                                tickLine={true} 
                                axisLine={{ stroke: "var(--border)" }} 
                                stroke="var(--muted-foreground)" 
                                tick={{ fill: 'var(--muted-foreground)' }}
                            />
                            <Tooltip 
                                cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '5 5' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        // e.g. 2026-04-17 to 17 Apr 2026
                                        const dateStr = new Date(label as string).toLocaleDateString('en-GB', { 
                                            day: '2-digit', 
                                            month: 'short', 
                                            year: 'numeric' 
                                        });
                                        const minutes = payload[0].value;
                                        
                                        return (
                                            <div className="bg-card text-card-foreground border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[1rem] px-4 py-3">
                                                <p className="font-extrabold text-sm mb-1">{dateStr}</p>
                                                <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                                                    {minutes ? "✨" : "🌱"} {minutes} {minutes === 1 ? "min" : "mins"} of focus
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="minutes"
                                stroke="var(--color-primary)"
                                strokeWidth={3}
                                dot={{ r: 4, fill: 'var(--color-card)', strokeWidth: 2 }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-primary)" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <Button size="lg" className="rounded-xl px-8 transition-transform hover:scale-[1.02] active:scale-95 bg-primary text-primary-foreground shadow-sm h-12 text-base" onClick={() => navigate("/study-tracker/study-session")}>
                Start Studying
            </Button>
        </div>
    );
}