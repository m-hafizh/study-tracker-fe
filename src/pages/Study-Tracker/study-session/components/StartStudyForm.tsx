import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStudySessionStore } from "@/stores/useStudySessionStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const times = [
    { label: "5 minutes", value: "00:05:00" },
    { label: "10 minutes", value: "00:10:00" },
    { label: "20 minutes", value: "00:20:00" },
    { label: "30 minutes", value: "00:30:00" },
    { label: "40 minutes", value: "00:40:00" },
    { label: "50 minutes", value: "00:50:00" },
    { label: "60 minutes", value: "01:00:00" },
];

const formSchema = z.object({
    subject: z.string({ message: "Subject is required" }).min(1, "Subject is required"),
    topic: z.string().min(1).optional(),
    duration: z.string({ message: "Duration is required" }).min(1, "Duration is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const StartStudyForm = () => {
    const { saveAndStartStudySession, updateStudySession } = useStudySessionStore();
    const { subjects, load: loadSubjects } = useSubjectStore();
    const hasSubjects = subjects.length > 0;

    useEffect(() => { loadSubjects(); }, [loadSubjects]);

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
    });

    const onSubmit = handleSubmit((data) => {
        if (!data.duration || data.duration === "00:00:00") return;

        saveAndStartStudySession({
            subject: data.subject,
            topic: data.topic ?? "-",
            duration: data.duration,
        });
        updateStudySession({ isStartStudy: false, isStudying: true, isSaveStudy: false });
    });

    return (
        <div className="mx-auto w-full max-w-md py-4">
            <div className="vibe-card rounded-[2rem] bg-card p-6 transition-shadow hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                <div className="mb-6 text-center space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Begin Session</h2>
                    <p className="text-sm text-muted-foreground">Log what you're working on right now.</p>
                </div>
                <form onSubmit={onSubmit} className="space-y-5">
                    {/* Subject */}
                    <div className="space-y-2.5">
                        <Label className="text-sm font-medium ml-1">
                            Subject <span className="text-destructive">*</span>
                        </Label>
                    <Controller
                        control={control}
                        name="subject"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!hasSubjects}
                            >
                                <SelectTrigger className="h-12 rounded-full px-4 border-transparent bg-muted/30 shadow-inner focus:ring-primary/50">
                                    <SelectValue placeholder={hasSubjects ? "Select subject" : "No subjects available"} />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-black/5 shadow-xl">
                                    {hasSubjects ? (
                                        subjects.map((s) => (
                                            <SelectItem key={s.id} value={s.subject} className="rounded-xl cursor-pointer">
                                                {s.subject}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                            No subjects yet. Create one first.
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {!hasSubjects ? (
                        <p className="text-xs text-muted-foreground ml-1">
                            You need at least one subject to start studying. {" "}
                            <Link to="/study-tracker/subject" className="font-medium text-primary underline underline-offset-4">
                                Create a subject
                            </Link>
                            .
                        </p>
                    ) : null}
                    {errors.subject && (
                        <p className="text-xs text-destructive ml-1">{errors.subject.message}</p>
                    )}
                </div>

                {/* Topic */}
                <div className="space-y-2.5">
                    <Label className="text-sm font-medium ml-1">Topic (Optional)</Label>
                    <Controller
                        control={control}
                        name="topic"
                        render={({ field }) => (
                            <Input
                                placeholder="e.g. Algebra"
                                className="h-12 rounded-full px-4 border-transparent bg-muted/30 shadow-inner focus-visible:ring-primary/50"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                            />
                        )}
                    />
                </div>

                {/* Duration */}
                <div className="space-y-2.5">
                    <Label className="text-sm font-medium ml-1">
                        Duration <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                        control={control}
                        name="duration"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger className="h-12 rounded-full px-4 border-transparent bg-muted/30 shadow-inner focus:ring-primary/50">
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-black/5 shadow-xl">
                                    {times.map((t) => (
                                        <SelectItem key={t.value} value={t.value} className="rounded-xl cursor-pointer">
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.duration && (
                            <p className="text-xs text-destructive ml-1">{errors.duration.message}</p>
                        )}
                    </div>

                    <div className="pt-2">
                        <Button size="lg" type="submit" className="h-12 w-full rounded-full text-sm" disabled={!hasSubjects}>
                            Start Studying
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};