import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudySessionStore } from "@/stores/useStudySessionStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { diffTime, timeToMinutes } from "@/utils/time";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { notifyMutationResult } from "@/lib/form-feedback";
import { toast } from "sonner";

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const formSchema = z.object({
    note: z.string().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const SaveStudyForm = () => {
    const navigate = useNavigate();
    const { subject, topic, duration, startTime, endTime, updateStudySession } =
        useStudySessionStore();

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<FormValues>({
        resolver: standardSchemaResolver(formSchema),
    });

    const { add: addSession } = useHistoryStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = handleSubmit(async (data) => {
        setIsSubmitting(true);
        const durationMins = timeToMinutes(duration);
        const result = await addSession({
            subject: subject ?? "",
            topic: topic ?? "-",
            startTime: startTime ?? "",
            endTime: endTime ?? "",
            durationMinutes: durationMins,
            date: new Date().toISOString().split("T")[0],
            notes: data.note ?? "",
        });

        const success = notifyMutationResult(result, {
            success: "Study session saved.",
            successOffline: "Session saved locally. It will sync once online.",
            error: "Failed to save study session.",
        });

        if (!success) {
            setIsSubmitting(false);
            return;
        }

        updateStudySession({
            isStartStudy: true,
            isStudying: false,
            isSaveStudy: false,
            isTimerActive: false,
            remainingSeconds: 0,
        });
        setIsSubmitting(false);
        navigate("/study-tracker");
    });

    const onCancel = () => {
        updateStudySession({
            isStartStudy: true,
            isStudying: false,
            isSaveStudy: false,
            isTimerActive: false,
            remainingSeconds: 0,
        });
        toast.info("Study session discarded.");
    };

    const diff = useMemo(() => diffTime(startTime, endTime), [startTime, endTime]);

    return (
        <div className="mx-auto w-full max-w-md py-4">
            <div className="vibe-card rounded-[2rem] bg-card p-6 transition-shadow hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                <div className="mb-4 text-center space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Save Session</h2>
                    <p className="text-sm text-muted-foreground">Review and log your completed study block.</p>
                </div>
                <form onSubmit={onSubmit} className="space-y-5">
                    
                    <div className="bg-muted/30 rounded-2xl p-4 space-y-2 shadow-inner ring-1 ring-inset ring-black/5 dark:ring-white/5">
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                            <div className="col-span-2 flex justify-between items-center bg-background rounded-xl px-4 py-2.5 shadow-sm border border-transparent">
                                <dt className="text-muted-foreground font-medium">Subject</dt>
                                <dd className="font-semibold text-right text-foreground truncate max-w-[60%]">{subject ?? "-"}</dd>
                            </div>
                            <div className="col-span-2 flex justify-between items-center bg-background rounded-xl px-4 py-2.5 shadow-sm border border-transparent">
                                <dt className="text-muted-foreground font-medium">Topic</dt>
                                <dd className="font-semibold text-right text-foreground truncate max-w-[60%]">{topic ?? "-"}</dd>
                            </div>
                            <div className="flex flex-col justify-center bg-background rounded-xl px-4 py-2.5 shadow-sm border border-transparent">
                                <dt className="text-muted-foreground font-medium text-xs mb-1">Time</dt>
                                <dd className="font-semibold text-foreground text-xs">{startTime ?? "-"} - {endTime ?? "-"}</dd>
                            </div>
                            <div className="flex flex-col justify-center bg-background rounded-xl px-4 py-2.5 shadow-sm border border-transparent">
                                <dt className="text-muted-foreground font-medium text-xs mb-1">Duration</dt>
                                <dd className="font-semibold text-sm text-foreground">
                                    <span className="text-primary">{diff === 0 ? "-" : `${diff.value}${capitalize(diff.unit)}`}</span>
                                </dd>
                            </div>
                        </dl>
                    </div>

                {/* Note */}
                <div className="space-y-2.5">
                    <Label className="text-sm font-medium ml-1">Notes (optional)</Label>
                    <Controller
                        control={control}
                        name="note"
                        render={({ field }) => (
                            <Textarea
                                placeholder="What did you study?"
                                className="resize-none h-20 min-h-[5rem] rounded-2xl bg-muted/30 border-transparent shadow-inner focus-visible:ring-primary/50 focus-visible:bg-background"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        )}
                    />
                    {errors.note && (
                        <p className="text-xs text-destructive ml-1">{errors.note.message}</p>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <Button size="lg" type="button" variant="outline" className="h-12 flex-1 rounded-full text-sm" onClick={onCancel} disabled={isSubmitting}>
                        Discard
                    </Button>
                    <Button size="lg" type="submit" className="h-12 flex-1 rounded-full text-sm" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Session"}
                    </Button>
                </div>
                </form>
            </div>
        </div>
    );
};