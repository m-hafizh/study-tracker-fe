import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Dispatch, SetStateAction } from "react";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { notifyMutationResult } from "@/lib/form-feedback";

type FormValues = {
    subject: string;
    color: string;
};

type OpenState = {
    type: "Add" | "Edit" | null;
    isOpen: boolean;
    item?: { id: string; subject: string; color: string } | null;
};

export default function FormModal({
    open,
    setOpen,
}: {
    open: OpenState;
    setOpen: Dispatch<SetStateAction<OpenState>>;
}) {
    const { add, update } = useSubjectStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormValues>({
        defaultValues: { color: "#eb5e41" },
    });

    useEffect(() => {
        if (open.isOpen && open.type === "Edit" && open.item) {
            reset({ subject: open.item.subject, color: open.item.color });
        } else if (open.isOpen && open.type === "Add") {
            reset({ subject: "", color: "#eb5e41" });
        }
    }, [open.isOpen, open.type, open.item, reset]);

    const close = () => setOpen((prev) => ({ ...prev, isOpen: false, item: null }));

    const onSubmit = handleSubmit(async (data) => {
        setIsSubmitting(true);

        try {
            const result =
                open.type === "Edit" && open.item
                    ? await update(open.item.id, { subject: data.subject, color: data.color })
                    : await add({ subject: data.subject, color: data.color });

            const success = notifyMutationResult(result, {
                success: open.type === "Edit" ? "Subject updated." : "Subject created.",
                successOffline:
                    open.type === "Edit"
                        ? "Subject updated locally. It will sync once online."
                        : "Subject created locally. It will sync once online.",
                error: open.type === "Edit" ? "Failed to update subject." : "Failed to create subject.",
            });

            if (success) close();
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <Dialog open={open.isOpen} onOpenChange={(v) => !v && close()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader className="mb-3">
                    <DialogTitle>{open.type ?? "Add"} Subject</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Subject */}
                    <div className="space-y-2.5">
                        <Label>Subject</Label>
                        <Controller
                            control={control}
                            name="subject"
                            render={({ field }) => (
                                <Input
                                    placeholder="Enter subject name"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                        {errors.subject && (
                            <p className="text-sm text-destructive">{errors.subject.message}</p>
                        )}
                    </div>

                    {/* Color */}
                    <div className="space-y-2.5">
                        <Label>Color</Label>
                        <Controller
                            name="color"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className="h-10 w-10 cursor-pointer rounded-lg border border-input"
                                    />
                                    <Input
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className="w-28"
                                    />
                                </div>
                            )}
                        />
                        {errors.color && (
                            <p className="text-sm text-destructive">{errors.color.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button size="sm" type="button" variant="outline" onClick={close} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button size="sm" type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? open.type === "Edit"
                                    ? "Saving..."
                                    : "Creating..."
                                : open.type === "Edit"
                                    ? "Save Changes"
                                    : "Create Subject"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}