import { useState, useEffect, useCallback, useRef } from "react";
import { useStudySessionStore } from "@/stores/useStudySessionStore";
import { durationFormat, convertTime, timeToSeconds } from "@/utils/time";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const StudyingTimer = () => {
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const {
        subject,
        topic,
        duration,
        isTimerActive,
        remainingSeconds,
        updateStudySession,
    } = useStudySessionStore();

    const initialSeconds =
        typeof remainingSeconds === "number" && remainingSeconds > 0
            ? remainingSeconds
            : timeToSeconds(duration);

    const [seconds, setSeconds] = useState<number>(initialSeconds);
    const [convertedTime, setConvertedTime] = useState("");
    const [isActive, setIsActive] = useState(Boolean(isTimerActive));

    const handlePause = useCallback(() => {
        if (isActive) {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            updateStudySession({ isTimerActive: false });
        }
    }, [isActive, updateStudySession]);

    const handleResume = useCallback(() => {
        if (!isActive) {
            setIsActive(true);
            updateStudySession({ isTimerActive: true });
        }
    }, [isActive, updateStudySession]);

    const handleStop = useCallback(() => {
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        updateStudySession({
            isStartStudy: false,
            isStudying: false,
            isSaveStudy: true,
            isTimerActive: false,
            remainingSeconds: 0,
            duration: duration,
            endTime: new Date().toLocaleTimeString(),
        });
    }, [duration, updateStudySession]);

    useEffect(() => {
        setConvertedTime(convertTime(seconds));
        updateStudySession({ remainingSeconds: Math.max(seconds, 0) });
        if (seconds <= 0 && isActive) handleStop();
    }, [seconds, handleStop, isActive, updateStudySession]);

    useEffect(() => {
        if (!isActive) return;

        timerRef.current = setInterval(() => {
            setSeconds((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive]);

    useEffect(() => {
        setSeconds(initialSeconds);
        setIsActive(Boolean(isTimerActive));
    }, [initialSeconds, isTimerActive]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const dur = durationFormat(duration);

    return (
        <div className="mx-auto w-full max-w-md py-4">
            <Card className="vibe-card rounded-[2rem] bg-card p-6">
                <CardContent className="space-y-4 pt-2 pb-0">
                    <div className="text-center space-y-1">
                        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Studying Time</CardTitle>
                        <p className="text-sm text-muted-foreground">Focus mode active.</p>
                        <p
                            className={`text-xs font-semibold ${isActive ? "text-emerald-500" : "text-amber-500"}`}
                            aria-live="polite"
                        >
                            Status: {isActive ? "Running" : "Paused"}
                        </p>
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-4 space-y-2 shadow-inner ring-1 ring-inset ring-black/5 dark:ring-white/5">
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                            <div className="col-span-2 flex justify-between items-center bg-background rounded-xl px-4 py-2.5 shadow-sm border border-transparent">
                                <dt className="text-muted-foreground font-medium w-1/3">Subject</dt>
                                <dd className="font-semibold text-right text-foreground truncate max-w-[60%]">{subject ?? "-"}</dd>
                            </div>
                            <div className="col-span-2 flex justify-between items-center bg-background rounded-xl px-4 py-2.5 shadow-sm border border-transparent">
                                <dt className="text-muted-foreground font-medium w-1/3">Topic</dt>
                                <dd className="font-semibold text-right text-foreground truncate max-w-[60%]">{topic ?? "-"}</dd>
                            </div>
                            <div className="col-span-2 flex justify-between items-center bg-background rounded-xl px-4 py-2.5 shadow-sm border border-transparent">
                                <dt className="text-muted-foreground font-medium w-1/3">Target</dt>
                                <dd className="font-semibold text-right text-foreground">{dur.value} {capitalize(dur.unit)}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="flex flex-col items-center justify-center py-2">
                        <h2 className="text-center font-mono text-[4rem] px-2 leading-none font-bold tracking-tighter text-primary drop-shadow-sm transition-all duration-300 tabular-nums">
                            {convertedTime}
                        </h2>
                    </div>
                </CardContent>
                <CardFooter className="justify-center gap-3 pb-2 pt-4 w-full flex">
                    {!isActive ? (
                        <Button size="lg" className="h-12 flex-1 rounded-full text-sm font-bold" onClick={handleResume}>Resume</Button>
                    ) : (
                        <Button size="lg" variant="outline" className="h-12 flex-1 rounded-full text-sm font-bold" onClick={handlePause}>Pause</Button>
                    )}
                    <Button size="lg" variant="destructive" className="h-12 flex-1 rounded-full text-sm font-bold" onClick={handleStop}>Stop</Button>
                </CardFooter>
            </Card>
        </div>
    );
};