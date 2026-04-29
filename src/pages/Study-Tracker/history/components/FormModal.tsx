import { useEffect, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { notifyMutationResult } from "@/lib/form-feedback";

type SessionItem = {
    id: string;
    subject: string;
    topic: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    date: string;
    notes: string;
} | null;

const formSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    topic: z.string().min(1).optional(),
    note: z.string().min(1).optional(),
    startHours: z.number().min(0).max(23).default(0),
    startMinutes: z.number().min(0).max(59).default(0),
    endHours: z.number().min(0).max(23).default(0),
    endMinutes: z.number().min(0).max(59).default(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function FormModal({
    open,
    item,
    onClose,
}: {
    open: boolean;
    item: SessionItem;
    onClose: () => void;
}) {
    const { update } = useHistoryStore();
    const { subjects, load: loadSubjects } = useSubjectStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { loadSubjects(); }, [loadSubjects]);

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm<FormValues>({
        resolver: standardSchemaResolver(formSchema) as unknown as Resolver<FormValues>,
    });

    useEffect(() => {
        if (open && item) {
            const [sh, sm] = (item.startTime || "00:00").split(":").map(Number);
            const [eh, em] = (item.endTime || "00:00").split(":").map(Number);
            reset({
                subject: item.subject,
                topic: item.topic,
                note: item.notes,
                startHours: sh ?? 0,
                startMinutes: sm ?? 0,
                endHours: eh ?? 0,
                endMinutes: em ?? 0,
            });
        }
    }, [open, item, reset]);

    const onSubmit = handleSubmit(async (data) => {
        if (!item) return;

        setIsSubmitting(true);

        try {
            const startStr = `${String(data.startHours).padStart(2, "0")}:${String(data.startMinutes).padStart(2, "0")}`;
            const endStr = `${String(data.endHours).padStart(2, "0")}:${String(data.endMinutes).padStart(2, "0")}`;

            const result = await update(item.id, {
                subject: data.subject,
                topic: data.topic ?? "",
                startTime: startStr,
                endTime: endStr,
                notes: data.note ?? "",
            });

            const success = notifyMutationResult(result, {
                success: "Study session updated.",
                successOffline: "Session updated locally. It will sync once online.",
                error: "Failed to update study session.",
            });

            if (success) {
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader className="mb-3">
                    <DialogTitle>Edit Study Session</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-5">
                    {/* Subject */}
                    <div className="space-y-2.5">
                        <Label>Subject <span className="text-destructive">*</span></Label>
                        <Controller
                            control={control}
                            name="subject"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((s) => (
                                            <SelectItem key={s.id} value={s.subject}>
                                                {s.subject}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
                    </div>

                    {/* Topic */}
                    <div className="space-y-2.5">
                        <Label>Topic</Label>
                        <Controller
                            control={control}
                            name="topic"
                            render={({ field }) => (
                                <Input
                                    placeholder="Topic"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                    </div>

                    {/* Start Time */}
                    <div className="space-y-2.5">
                        <Label>Start Time</Label>
                        <div className="flex items-center gap-2">
                            <Controller
                                control={control}
                                name="startHours"
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        min={0}
                                        max={23}
                                        className="w-20"
                                        value={String(field.value ?? 0).padStart(2, "0")}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                )}
                            />
                            <span className="text-muted-foreground">:</span>
                            <Controller
                                control={control}
                                name="startMinutes"
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        min={0}
                                        max={59}
                                        className="w-20"
                                        value={String(field.value ?? 0).padStart(2, "0")}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* End Time */}
                    <div className="space-y-2.5">
                        <Label>End Time</Label>
                        <div className="flex items-center gap-2">
                            <Controller
                                control={control}
                                name="endHours"
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        min={0}
                                        max={23}
                                        className="w-20"
                                        value={String(field.value ?? 0).padStart(2, "0")}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                )}
                            />
                            <span className="text-muted-foreground">:</span>
                            <Controller
                                control={control}
                                name="endMinutes"
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        min={0}
                                        max={59}
                                        className="w-20"
                                        value={String(field.value ?? 0).padStart(2, "0")}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-2.5">
                        <Label>Note</Label>
                        <Controller
                            control={control}
                            name="note"
                            render={({ field }) => (
                                <Textarea
                                    placeholder="What did you study?"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    rows={4}
                                />
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <Button size="sm" type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button size="sm" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
