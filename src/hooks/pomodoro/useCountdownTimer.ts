import { useState, useEffect, useRef, useCallback } from "react";

export function useCountdownTimer(initialMinutes: number = 10, onComplete?: () => void) {
    const [remainingTime, setRemainingTime] = useState<number>(initialMinutes * 60);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const formatTime = useCallback((seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return [hrs, mins, secs]
            .map(unit => String(unit).padStart(2, "0"))
            .join(" : ");
    }, []);

    const start = useCallback(() => {
        if (isRunning || remainingTime <= 0) return;
        setIsRunning(true);

        intervalRef.current = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    setIsRunning(false);
                    if (onComplete) onComplete(); // ✅ trigger streak increment or any callback
                    alert("⏰ Time's up!");
                    return 0;
                }
                return prev - 1;
            })
        }, 1000);
    }, [isRunning, remainingTime, onComplete]);

    const pause = useCallback(() => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    const reset = useCallback(() => {
        pause();
        setRemainingTime(initialMinutes * 60);
    }, [pause, initialMinutes]);

    const setMinutes = useCallback((minutes: number) => {
        if (minutes <= 0 || isNaN(minutes)) {
            alert("Please enter a valid number of minutes!");
            return;
        }
        pause();
        setRemainingTime(minutes * 60);
    }, [pause]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return {
        remainingTime,
        isRunning,
        start,
        pause,
        reset,
        formatTime,
        setMinutes
    };
}