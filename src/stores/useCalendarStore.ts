import { create } from "zustand";
import type { NewStudyPlanEvent, StudyPlanEvent } from "@/models/calendar";
import {
  clearCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
} from "@/api/calendar";
import {
  clearOfflineCalendarEvents,
  createOfflineCalendarEvent,
  deleteOfflineCalendarEvent,
  readCalendarCache,
  updateOfflineCalendarEvent,
  writeCalendarCache,
} from "@/features/workspace/offlineSync";
import type { MutationResult } from "@/lib/form-feedback";

const now = () => new Date().toISOString();

const isNetworkError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { response?: unknown; code?: string };
  return !candidate.response || candidate.code === "ERR_NETWORK";
};

const seedEvents = (): StudyPlanEvent[] => {
  const timestamp = now();
  return [
    {
      id: crypto.randomUUID(),
      title: "Review Calculus Chapter 4",
      subject: "Math",
      date: new Date().toISOString().split("T")[0],
      startTime: "19:00",
      endTime: "20:00",
      allDay: false,
      color: "#8b5cf6",
      notes: "Focus on integration by parts.",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
};

const sortEvents = (events: StudyPlanEvent[]) =>
  [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;

    const aTime = a.startTime ?? "99:99";
    const bTime = b.startTime ?? "99:99";
    return aTime.localeCompare(bTime);
  });

function readEvents(): StudyPlanEvent[] {
  const cached = readCalendarCache();
  return cached.length > 0 ? sortEvents(cached) : seedEvents();
}

function saveEvents(events: StudyPlanEvent[]) {
  writeCalendarCache(events);
}

type CalendarState = {
  events: StudyPlanEvent[];
  load: () => void;
  addEvent: (event: NewStudyPlanEvent) => Promise<MutationResult>;
  updateEvent: (eventId: string, patch: Partial<NewStudyPlanEvent>) => Promise<MutationResult>;
  deleteEvent: (eventId: string) => Promise<MutationResult>;
  clearAll: () => Promise<MutationResult>;
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],

  load: () => {
    void (async () => {
      try {
        const items = await getCalendarEvents();
        const sorted = sortEvents(items);
        writeCalendarCache(sorted);
        set({ events: sorted });
      } catch (error) {
        if (isNetworkError(error)) {
          set({ events: readEvents() });
          return;
        }

        set({ events: readEvents() });
      }
    })();
  },

  addEvent: async (event) => {
    const payload: NewStudyPlanEvent = {
      ...event,
      title: event.title.trim(),
      subject: event.subject?.trim() || undefined,
      startTime: event.allDay ? undefined : event.startTime,
      endTime: event.allDay ? undefined : event.endTime,
      notes: event.notes?.trim() || undefined,
    };

    if (!payload.title) {
      return { ok: false, error: new Error("Title is required") };
    }

    try {
      const created = await createCalendarEvent(payload);
      const updated = sortEvents([...get().events.filter((entry) => entry.id !== created.id), created]);
      saveEvents(updated);
      set({ events: updated });
      return { ok: true };
    } catch (error) {
      if (isNetworkError(error)) {
        const updated = sortEvents(createOfflineCalendarEvent(payload));
        set({ events: updated });
        return { ok: true, offline: true };
      }

      return { ok: false, error };
    }
  },

  updateEvent: async (eventId, patch) => {
    const original = get().events.find((event) => event.id === eventId);
    if (!original) return { ok: false, error: new Error("Event not found") };

    const nextTitle = (patch.title ?? original.title).trim();
    if (!nextTitle) return { ok: false, error: new Error("Title is required") };

    const nextAllDay = patch.allDay ?? original.allDay;
    const payload: Partial<NewStudyPlanEvent> = {
      ...patch,
      title: nextTitle,
      subject: patch.subject !== undefined ? patch.subject.trim() || undefined : original.subject,
      notes: patch.notes !== undefined ? patch.notes.trim() || undefined : original.notes,
      startTime: nextAllDay ? undefined : patch.startTime ?? original.startTime,
      endTime: nextAllDay ? undefined : patch.endTime ?? original.endTime,
      allDay: nextAllDay,
    };

    try {
      const saved = await updateCalendarEvent(eventId, payload);
      const updated = sortEvents(get().events.map((entry) => (entry.id === eventId ? saved : entry)));
      saveEvents(updated);
      set({ events: updated });
      return { ok: true };
    } catch (error) {
      if (isNetworkError(error)) {
        const updated = sortEvents(updateOfflineCalendarEvent(eventId, payload));
        set({ events: updated });
        return { ok: true, offline: true };
      }

      return { ok: false, error };
    }
  },

  deleteEvent: async (eventId) => {
    try {
      await deleteCalendarEvent(eventId);
      const updated = get().events.filter((event) => event.id !== eventId);
      saveEvents(updated);
      set({ events: updated });
      return { ok: true };
    } catch (error) {
      if (isNetworkError(error)) {
        const updated = sortEvents(deleteOfflineCalendarEvent(eventId));
        set({ events: updated });
        return { ok: true, offline: true };
      }

      return { ok: false, error };
    }
  },

  clearAll: async () => {
    try {
      await clearCalendarEvents();
      saveEvents([]);
      set({ events: [] });
      return { ok: true };
    } catch (error) {
      if (isNetworkError(error)) {
        const updated = clearOfflineCalendarEvents();
        set({ events: updated });
        return { ok: true, offline: true };
      }

      return { ok: false, error };
    }
  },
}));
