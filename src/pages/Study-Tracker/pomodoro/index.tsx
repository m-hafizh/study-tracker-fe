import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePomodoroTimer } from "@/hooks/pomodoro/usePomodoroTimer";
import type { PomodoroPhase } from "@/hooks/pomodoro/usePomodoroTimer";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { LeaveStudySessionGuard } from "@/pages/Study-Tracker/study-session/components/LeaveStudySessionGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
    LuPlay,
    LuPause,
    LuRotateCcw,
    LuSkipForward,
    LuSettings,
} from "react-icons/lu";
import { toast } from "sonner";
import { notifyMutationResult } from "@/lib/form-feedback";

export default function Pomodoro() {
    const { add: addSession, load: loadHistory } = useHistoryStore();

    useEffect(() => { loadHistory(); }, [loadHistory]);

    const onFocusComplete = useCallback((minutes: number) => {
        void (async () => {
            const result = await addSession({
                subject: "Pomodoro",
                topic: "Focus session",
                startTime: "",
                endTime: "",
                durationMinutes: minutes,
                date: new Date().toISOString().split("T")[0],
                notes: `Completed pomodoro focus (${minutes} min)`,
            });

            notifyMutationResult(result, {
                success: `Great job! You completed ${minutes} minutes of focus.`,
                successOffline: `Focus session saved locally (${minutes} min). It will sync once online.`,
                error: "Focus session finished, but saving to history failed.",
            });
        })();
    }, [addSession]);

    const pomo = usePomodoroTimer(onFocusComplete);
    const [showSettings, setShowSettings] = useState(false);

    const handleResetCurrent = () => {
        pomo.reset();
        toast.info("Current timer reset.");
    };

    const handleSkipPhase = () => {
        const currentPhase = pomo.phaseLabel;
        pomo.skip();
        toast.info(`${currentPhase} skipped.`);
    };

    const handleResetDefaults = () => {
        pomo.updateConfig({
            focusMinutes: 25,
            shortBreakMinutes: 5,
            longBreakMinutes: 15,
            sessionsBeforeLongBreak: 4,
        });
        toast.success("Timer settings reset to defaults.");
    };

    const handleResetAllSessions = () => {
        pomo.resetAll();
        toast.info("All pomodoro sessions reset.");
    };

    const phaseColors = {
        focus: { bg: "bg-primary/5", text: "text-primary", indicator: "bg-primary" },
        shortBreak: { bg: "bg-secondary", text: "text-secondary-foreground", indicator: "bg-secondary-foreground" },
        longBreak: { bg: "bg-muted", text: "text-muted-foreground", indicator: "bg-primary" },
    };
    const colors = phaseColors[pomo.phase];

    return (
        <AppLayout>
            <LeaveStudySessionGuard when={pomo.isRunning} />
            <div className="mx-auto flex w-full max-w-md flex-col items-center pt-4">
                {/* Phase Tabs */}
                <Tabs value={pomo.phase} onValueChange={(val) => {
                    if (!pomo.isRunning) {
                        pomo.switchPhase(val as PomodoroPhase);
                        pomo.resetAll();
                    }
                }} className="mb-4 w-full">
                    <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/30 rounded-full h-12 shadow-inner ring-1 ring-inset ring-black/5 dark:ring-white/5">
                        <TabsTrigger value="focus" disabled={pomo.isRunning} className="rounded-full h-full text-xs font-bold transition-all data-[state=active]:shadow-sm">Focus</TabsTrigger>
                        <TabsTrigger value="shortBreak" disabled={pomo.isRunning} className="rounded-full h-full text-xs font-bold transition-all data-[state=active]:shadow-sm">Short Break</TabsTrigger>
                        <TabsTrigger value="longBreak" disabled={pomo.isRunning} className="rounded-full h-full text-xs font-bold transition-all data-[state=active]:shadow-sm">Long Break</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Timer Card */}
                <Card className={cn("vibe-card w-full rounded-[2rem] transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]", colors.bg)}>
                    <CardContent className="flex flex-col items-center py-6 sm:py-8">
                        <span className={cn("mb-2 text-xs font-extrabold uppercase tracking-widest", colors.text)}>
                            {pomo.phaseLabel}
                        </span>

                        <span className={cn("font-mono text-[4.5rem] sm:text-[5.5rem] leading-none font-bold tracking-tighter drop-shadow-sm tabular-nums transition-colors duration-500", colors.text)}>
                            {pomo.display}
                        </span>

                        <div className="mt-6 w-full max-w-[80%]">
                            <Progress
                                value={pomo.progressPct}
                                className="h-2.5 rounded-full bg-muted/50"
                                indicatorClassName={cn("transition-all duration-1000 ease-linear rounded-full", colors.indicator)}
                            />
                        </div>

                        <div className="mt-8 flex w-full max-w-[85%] items-center justify-center gap-3">
                            {!pomo.isRunning ? (
                                <Button size="lg" className={cn("h-14 flex-1 rounded-full text-lg font-bold text-primary-foreground", colors.indicator)} onClick={pomo.start}>
                                    <LuPlay className="mr-2 h-5 w-5 fill-current" />
                                    {pomo.remainingSeconds < pomo.totalSeconds ? "Resume" : "Start"}
                                </Button>
                            ) : (
                                <Button size="lg" variant="outline" className="h-14 flex-1 rounded-full bg-background/50 text-lg font-bold" onClick={pomo.pause}>
                                    <LuPause className="mr-2 h-5 w-5 fill-current" /> Pause
                                </Button>
                            )}
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-muted/30 text-foreground/50 hover:bg-muted/50 hover:text-foreground" onClick={handleResetCurrent} disabled={pomo.isRunning}>
                                    <LuRotateCcw className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-muted/30 text-foreground/50 hover:bg-muted/50 hover:text-foreground" onClick={handleSkipPhase}>
                                    <LuSkipForward className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Session dots */}
                <div className="mt-5 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sessions</span>
                    <div className="flex flex-wrap gap-1.5 px-2">
                        {Array.from({ length: pomo.config.sessionsBeforeLongBreak }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-3 w-3 rounded-full transition-colors",
                                    i < (pomo.completedSessions % pomo.config.sessionsBeforeLongBreak || (pomo.completedSessions > 0 && pomo.completedSessions % pomo.config.sessionsBeforeLongBreak === 0 ? pomo.config.sessionsBeforeLongBreak : 0))
                                        ? colors.indicator : "bg-muted"
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-bold text-foreground">{pomo.completedSessions}</span>
                </div>

                {/* Settings toggle */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 rounded-full text-xs font-semibold text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all duration-300"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    <LuSettings className="mr-1.5 h-3.5 w-3.5" />
                    {showSettings ? "Hide Settings" : "Timer Settings"}
                </Button>

                {/* Settings */}
                {showSettings && (
                    <Card className="vibe-card mt-3 w-full rounded-[2rem] bg-muted/20 shadow-inner ring-1 ring-inset ring-black/5 dark:ring-white/5">
                        <CardContent className="space-y-3 pt-5 pb-5 px-5">
                            <h3 className="text-sm font-bold text-foreground pl-1">Timer Config</h3>

                            {([
                                { label: "Focus (min)", key: "focusMinutes" as const, min: 1, max: 120, step: 5 },
                                { label: "Short Break (min)", key: "shortBreakMinutes" as const, min: 1, max: 30, step: 1 },
                                { label: "Long Break (min)", key: "longBreakMinutes" as const, min: 1, max: 60, step: 5 },
                                { label: "Sessions before Long Break", key: "sessionsBeforeLongBreak" as const, min: 2, max: 10, step: 1 },
                            ] as const).map((s) => (
                                <div key={s.key} className="flex justify-between items-center bg-background p-2.5 px-4 rounded-xl shadow-sm border border-transparent">
                                    <Label className="mb-0 text-sm font-medium text-muted-foreground">{s.label}</Label>
                                    <Input
                                        type="number"
                                        min={s.min}
                                        max={s.max}
                                        step={s.step}
                                        className="h-8 w-16 text-center rounded-full bg-muted/50 border-transparent shadow-inner text-sm font-bold focus-visible:ring-primary/50"
                                        value={pomo.config[s.key]}
                                        onChange={(e) => pomo.updateConfig({ [s.key]: Number(e.target.value) })}
                                        disabled={pomo.isRunning}
                                    />
                                </div>
                            ))}

                            <div className="flex flex-col gap-2 pt-2 w-full">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleResetDefaults}
                                    disabled={pomo.isRunning}
                                    className="h-10 rounded-full"
                                >
                                    Reset to Defaults (25/5/15)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 mb-6 rounded-full text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                    onClick={handleResetAllSessions}
                    disabled={pomo.isRunning}
                >
                    Reset All Sessions
                </Button>
            </div>
        </AppLayout>
    );
}
