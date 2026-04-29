import { useState, useEffect, useRef } from "react";

export function useTimer() {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const start = () => {
        if (isRunning) return;
        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    };

    const pause = () => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const reset = () => {
        pause();
        setElapsedTime(0);
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return [hrs, mins, secs]
            .map(unit => String(unit).padStart(2, "0"))
            .join(" : ");
    };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    elapsedTime,
    isRunning,
    start,
    pause,
    reset,
    formatTime,
  };
}