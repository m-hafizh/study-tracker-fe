import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { KanbanCard, KanbanPriority, NewKanbanCard } from "@/models/kanban";
import { toast } from "sonner";

type FormValues = {
  title: string;
  subject: string;
  notes: string;
  estimateMinutes: string;
  dueDate: string;
  priority: "none" | KanbanPriority;
};

export function KanbanCardDialog({
  open,
  mode,
  card,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  card?: KanbanCard;
  onClose: () => void;
  onSubmit: (data: NewKanbanCard) => void | Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: "",
      subject: "",
      notes: "",
      estimateMinutes: "",
      dueDate: "",
      priority: "none",
    },
  });

  useEffect(() => {
    if (open && mode === "edit" && card) {
      reset({
        title: card.title,
        subject: card.subject ?? "",
        notes: card.notes ?? "",
        estimateMinutes: card.estimateMinutes ? String(card.estimateMinutes) : "",
        dueDate: card.dueDate ?? "",
        priority: card.priority ?? "none",
      });
      return;
    }

    if (open && mode === "create") {
      reset({
        title: "",
        subject: "",
        notes: "",
        estimateMinutes: "",
        dueDate: "",
        priority: "none",
      });
    }
  }, [open, mode, card, reset]);

  const submit = handleSubmit(async (data) => {
    if (!data.title.trim()) return;

    setIsSubmitting(true);
    try {
      await Promise.resolve(onSubmit({
        title: data.title.trim(),
        subject: data.subject.trim() || undefined,
        notes: data.notes.trim() || undefined,
        estimateMinutes: data.estimateMinutes ? Number(data.estimateMinutes) : undefined,
        dueDate: data.dueDate || undefined,
        priority: data.priority === "none" ? undefined : data.priority,
      }));

      toast.success(mode === "create" ? "Task created." : "Task updated.");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : mode === "create" ? "Failed to create task." : "Failed to update task.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="mb-3">
          <DialogTitle>{mode === "create" ? "Add Study Task" : "Edit Study Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2.5">
            <Label>Title</Label>
            <Controller
              name="title"
              control={control}
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <Input {...field} placeholder="e.g. Revise Calculus Chapter 3" />
              )}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2.5">
              <Label>Subject</Label>
              <Controller
                name="subject"
                control={control}
                render={({ field }) => <Input {...field} placeholder="Math" />}
              />
            </div>

            <div className="space-y-2.5">
              <Label>Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2.5">
              <Label>Estimate (minutes)</Label>
              <Controller
                name="estimateMinutes"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" min={0} placeholder="45" />
                )}
              />
            </div>

            <div className="space-y-2.5">
              <Label>Due Date</Label>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => <Input {...field} type="date" />}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <Label>Notes</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea {...field} rows={4} placeholder="What specifically will you study?" />
              )}
            />
          </div>

          <DialogFooter className="items-center">
            <Button type="button" variant="outline" size="sm" className="h-9 rounded-md px-5" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" size="sm" className="h-9 rounded-md px-5" disabled={isSubmitting}>
              {isSubmitting ? (mode === "create" ? "Adding..." : "Saving...") : mode === "create" ? "Add Card" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
