import { useState, useEffect, useRef, useCallback, useMemo } from "react";

export type PomodoroPhase = "focus" | "shortBreak" | "longBreak";

export type PomodoroConfig = {
    focusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    sessionsBeforeLongBreak: number;  // typically 4
};

const DEFAULT_CONFIG: PomodoroConfig = {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
};

const STORAGE_KEY = "study-tracker:pomodoro-config";

function loadConfig(): PomodoroConfig {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
    } catch {
        return DEFAULT_CONFIG;
    }
}

function saveConfig(config: PomodoroConfig) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function usePomodoroTimer(onFocusComplete?: (minutes: number) => void) {
    const [config, setConfigState] = useState<PomodoroConfig>(loadConfig);
    const [phase, setPhase] = useState<PomodoroPhase>("focus");
    const [remainingSeconds, setRemainingSeconds] = useState(config.focusMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Derived
    const totalSeconds = useMemo(() => {
        switch (phase) {
            case "focus": return config.focusMinutes * 60;
            case "shortBreak": return config.shortBreakMinutes * 60;
            case "longBreak": return config.longBreakMinutes * 60;
        }
    }, [phase, config]);

    const progressPct = useMemo(() => {
        if (totalSeconds === 0) return 0;
        return Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100);
    }, [remainingSeconds, totalSeconds]);

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }, []);

    // ── Tick ──
    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const tick = useCallback(() => {
        setRemainingSeconds(prev => {
            if (prev <= 1) {
                clearTimer();
                setIsRunning(false);
                return 0;
            }
            return prev - 1;
        });
    }, [clearTimer]);

    // When remaining hits 0, auto-advance phase
    useEffect(() => {
        if (remainingSeconds === 0 && !isRunning) {
            if (phase === "focus") {
                const newCompleted = completedSessions + 1;
                setCompletedSessions(newCompleted);
                onFocusComplete?.(config.focusMinutes);

                // Decide next break
                if (newCompleted % config.sessionsBeforeLongBreak === 0) {
                    setPhase("longBreak");
                    setRemainingSeconds(config.longBreakMinutes * 60);
                } else {
                    setPhase("shortBreak");
                    setRemainingSeconds(config.shortBreakMinutes * 60);
                }
            } else {
                // Break is over → back to focus
                setPhase("focus");
                setRemainingSeconds(config.focusMinutes * 60);
            }
        }
    }, [
        remainingSeconds,
        isRunning,
        phase,
        completedSessions,
        config.focusMinutes,
        config.shortBreakMinutes,
        config.longBreakMinutes,
        config.sessionsBeforeLongBreak,
        onFocusComplete,
    ]);

    // ── Controls ──
    const start = useCallback(() => {
        if (isRunning || remainingSeconds <= 0) return;
        setIsRunning(true);
        intervalRef.current = setInterval(tick, 1000);
    }, [isRunning, remainingSeconds, tick]);

    const pause = useCallback(() => {
        setIsRunning(false);
        clearTimer();
    }, [clearTimer]);

    const reset = useCallback(() => {
        pause();
        setRemainingSeconds(totalSeconds);
    }, [pause, totalSeconds]);

    const skip = useCallback(() => {
        pause();
        setRemainingSeconds(0);
        // The useEffect above will handle phase transition
        // We need to trigger it manually since pause sets isRunning=false and remaining=0
        // Force a re-render cycle
        setTimeout(() => setRemainingSeconds(0), 0);
    }, [pause]);

    const resetAll = useCallback(() => {
        pause();
        setPhase("focus");
        setCompletedSessions(0);
        setRemainingSeconds(config.focusMinutes * 60);
    }, [pause, config]);

    const updateConfig = useCallback((partial: Partial<PomodoroConfig>) => {
        setConfigState(prev => {
            const updated = { ...prev, ...partial };
            saveConfig(updated);
            return updated;
        });
    }, []);

    const switchPhase = useCallback((newPhase: PomodoroPhase) => {
        setPhase(newPhase);
    }, []);

    // When config changes and timer isn't running, update remaining time
    useEffect(() => {
        if (!isRunning) {
            switch (phase) {
                case "focus": setRemainingSeconds(config.focusMinutes * 60); break;
                case "shortBreak": setRemainingSeconds(config.shortBreakMinutes * 60); break;
                case "longBreak": setRemainingSeconds(config.longBreakMinutes * 60); break;
            }
        }
    }, [config, isRunning, phase]);

    // Cleanup on unmount
    useEffect(() => clearTimer, [clearTimer]);

    return {
        // State
        phase,
        remainingSeconds,
        isRunning,
        completedSessions,
        config,
        progressPct,
        totalSeconds,
        // Formatted
        display: formatTime(remainingSeconds),
        phaseLabel: phase === "focus" ? "Focus" : phase === "shortBreak" ? "Short Break" : "Long Break",
        // Controls
        start,
        pause,
        reset,
        skip,
        resetAll,
        updateConfig,
        switchPhase,
    };
}
