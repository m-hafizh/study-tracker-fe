import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { NewStudyPlanEvent, StudyPlanEvent } from "@/models/calendar";
import type { MutationResult } from "@/lib/form-feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_EVENT_COLOR = "#8b5cf6";

type EventFormValues = {
  title: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  color: string;
  notes: string;
};

export function EventFormModal({
  open,
  mode,
  event,
  defaultDate,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: {
  open: boolean;
  mode: "create" | "edit";
  event?: StudyPlanEvent;
  defaultDate: string;
  onClose: () => void;
  onCreate: (data: NewStudyPlanEvent) => Promise<MutationResult>;
  onUpdate: (eventId: string, data: Partial<NewStudyPlanEvent>) => Promise<MutationResult>;
  onDelete: (eventId: string) => Promise<MutationResult>;
}) {
  const [form, setForm] = useState<EventFormValues>({
    title: "",
    subject: "",
    date: defaultDate,
    startTime: "",
    endTime: "",
    allDay: false,
    color: DEFAULT_EVENT_COLOR,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && event) {
      setForm({
        title: event.title,
        subject: event.subject ?? "",
        date: event.date,
        startTime: event.startTime ?? "",
        endTime: event.endTime ?? "",
        allDay: event.allDay,
        color: event.color ?? DEFAULT_EVENT_COLOR,
        notes: event.notes ?? "",
      });
      return;
    }

    setForm({
      title: "",
      subject: "",
      date: defaultDate,
      startTime: "",
      endTime: "",
      allDay: false,
      color: DEFAULT_EVENT_COLOR,
      notes: "",
    });
  }, [open, mode, event, defaultDate]);

  const timeRangeError = useMemo(() => {
    if (form.allDay) return null;

    if (!form.startTime || !form.endTime) {
      return "Start and end time are required for non all-day plans.";
    }

    if (form.startTime >= form.endTime) {
      return "End time must be after start time.";
    }

    return null;
  }, [form.allDay, form.startTime, form.endTime]);

  const canSubmit = useMemo(
    () => form.title.trim().length > 0 && form.date.length > 0 && !timeRangeError,
    [form.title, form.date, timeRangeError]
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    const payload: NewStudyPlanEvent = {
      title: form.title,
      subject: form.subject,
      date: form.date,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      allDay: form.allDay,
      color: form.color,
      notes: form.notes,
    };

    setIsSubmitting(true);
    try {
      const result = mode === "edit" && event
        ? await onUpdate(event.id, payload)
        : await onCreate(payload);

      if (result.ok) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="my-[0.625rem] rounded-2xl p-4 sm:max-w-md sm:p-5">
        <DialogHeader className="mb-3">
          <DialogTitle>{mode === "create" ? "Create Study Plan" : "Edit Study Plan"}</DialogTitle>
          <DialogDescription>
            Plan your study block like a mini calendar event.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          <div className="space-y-2.5">
            <Label>Title</Label>
            <Input
              autoFocus
              placeholder="e.g. Revise Biology Notes"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2.5">
            <Label>Subject</Label>
            <Input
              placeholder="Subject (optional)"
              value={form.subject}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2.5">
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-input"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={form.allDay ? "default" : "outline"}
              className="h-9 rounded-md"
              onClick={() => setForm((prev) => ({
                ...prev,
                allDay: !prev.allDay,
                ...(prev.allDay ? {} : { startTime: "", endTime: "" })
              }))}
            >
              {form.allDay ? "All-day event" : "Set as all-day"}
            </Button>
          </div>

          {!form.allDay && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2.5">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                />
              </div>

              <div className="space-y-2.5">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                />
              </div>

              {timeRangeError ? (
                <p className="col-span-full text-xs text-destructive">{timeRangeError}</p>
              ) : null}
            </div>
          )}

          <div className="space-y-2.5">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              className="min-h-[112px]"
              placeholder="Optional notes"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <DialogFooter className="!mt-1 !flex-col !gap-2 sm:!flex-row sm:!items-center">
            {mode === "edit" && event ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-9 w-full rounded-md px-4 text-white hover:text-white sm:mr-auto sm:w-auto"
                disabled={isSubmitting}
                onClick={() => {
                  if (isSubmitting) return;

                  void (async () => {
                    setIsSubmitting(true);
                    try {
                      const result = await onDelete(event.id);
                      if (result.ok) {
                        onClose();
                      }
                    } finally {
                      setIsSubmitting(false);
                    }
                  })();
                }}
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </Button>
            ) : null}

            <div className="flex w-full flex-col-reverse gap-2 sm:ml-auto sm:w-auto sm:flex-row">
              <Button type="button" variant="outline" size="sm" className="h-9 w-full rounded-md px-5 sm:w-auto" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-9 w-full rounded-md px-5 sm:w-auto" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
