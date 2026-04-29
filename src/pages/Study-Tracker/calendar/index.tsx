import { useEffect, useMemo, useState } from "react";
import {
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuFilter,
  LuPencil,
  LuPlus,
} from "react-icons/lu";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/custom/EmptyState";
import type { StudyPlanEvent } from "@/models/calendar";
import { useCalendarStore } from "@/stores/useCalendarStore";
import { EventFormModal } from "./components/EventFormModal";
import { notifyMutationResult } from "@/lib/form-feedback";

const weekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_EVENT_COLOR = "#8b5cf6";

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const monthLabel = (date: Date) =>
  date.toLocaleString("en-US", { month: "long", year: "numeric" });

const timeLabel = (event: StudyPlanEvent) => {
  if (event.allDay) return "All day";
  if (event.startTime && event.endTime) return `${event.startTime} - ${event.endTime}`;
  return event.startTime || "No time";
};

const getEventColor = (event: StudyPlanEvent) => event.color?.trim() || DEFAULT_EVENT_COLOR;

function buildMonthGrid(activeMonth: Date) {
  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const offset = firstDay.getDay();
  const gridStart = new Date(year, month, 1 - offset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export default function CalendarPage() {
  const { events, load, addEvent, updateEvent, deleteEvent } = useCalendarStore();

  const [activeMonth, setActiveMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<StudyPlanEvent | null>(null);

  const todayKey = toDateKey(new Date());

  useEffect(() => {
    load();
  }, [load]);

  const days = useMemo(() => buildMonthGrid(activeMonth), [activeMonth]);

  const uniqueSubjects = useMemo(() => {
    const values = events
      .map((event) => event.subject?.trim())
      .filter((value): value is string => !!value);
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (subjectFilter === "all") return events;
    return events.filter((event) => event.subject === subjectFilter);
  }, [events, subjectFilter]);

  const hasActiveFilter = subjectFilter !== "all";

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, StudyPlanEvent[]>();
    for (const event of filteredEvents) {
      const current = grouped.get(event.date) ?? [];
      current.push(event);
      current.sort((a, b) => {
        if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
        return (a.startTime ?? "99:99").localeCompare(b.startTime ?? "99:99");
      });
      grouped.set(event.date, current);
    }
    return grouped;
  }, [filteredEvents]);

  const upcomingEvents = useMemo(() => {
    const max = new Date();
    max.setDate(max.getDate() + 7);
    const maxDate = toDateKey(max);

    return filteredEvents
      .filter((event) => event.date >= todayKey && event.date <= maxDate)
      .slice(0, 10);
  }, [filteredEvents, todayKey]);

  const openCreate = (date: string) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setFormOpen(true);
  };

  const handleCreate = async (payload: Parameters<typeof addEvent>[0]) => {
    const result = await addEvent(payload);
    notifyMutationResult(result, {
      success: "Study plan created.",
      successOffline: "Study plan saved locally. It will sync once online.",
      error: "Failed to create study plan.",
    });
    return result;
  };

  const handleUpdate = async (
    eventId: string,
    payload: Parameters<typeof updateEvent>[1]
  ) => {
    const result = await updateEvent(eventId, payload);
    notifyMutationResult(result, {
      success: "Study plan updated.",
      successOffline: "Study plan updated locally. It will sync once online.",
      error: "Failed to update study plan.",
    });
    return result;
  };

  const handleDelete = async (eventId: string) => {
    const result = await deleteEvent(eventId);
    notifyMutationResult(result, {
      success: "Study plan deleted.",
      successOffline: "Study plan removed locally. It will sync once online.",
      error: "Failed to delete study plan.",
    });
    return result;
  };

  const openEdit = (event: StudyPlanEvent) => {
    setSelectedDate(event.date);
    setEditingEvent(event);
    setFormOpen(true);
  };

  const goPrevMonth = () => {
    setActiveMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setActiveMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToday = () => {
    const today = new Date();
    setActiveMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(toDateKey(today));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (formOpen) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      const active = document.activeElement as HTMLElement | null;
      const tagName = active?.tagName?.toLowerCase();
      const isTypingContext =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        !!active?.isContentEditable;

      if (isTypingContext) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevMonth();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNextMonth();
        return;
      }

      if (event.key.toLowerCase() === "t") {
        event.preventDefault();
        goToday();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [formOpen]);

  return (
    <AppLayout>
      <div className="mx-auto flex h-[calc(100dvh-7.75rem)] w-full max-w-7xl flex-col gap-4 overflow-hidden md:h-[calc(100dvh-8.25rem)] lg:h-[calc(100dvh-9rem)]">
        <div className="flex justify-end">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="h-10 rounded-full" onClick={goPrevMonth}>
              <LuChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-10 rounded-full" onClick={goNextMonth}>
              <LuChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-10 rounded-full" onClick={goToday}>Today</Button>
            <Button className="h-10 rounded-full" onClick={() => openCreate(toDateKey(new Date()))}>
              <LuPlus className="mr-1 h-4 w-4" /> New Plan
            </Button>
          </div>
        </div>

        <div className="vibe-card flex flex-wrap items-center gap-2 rounded-[1.25rem] bg-card p-3">
          <div className="rounded-full bg-muted/45 px-4 py-2 text-sm font-semibold text-foreground">
            {monthLabel(activeMonth)}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <LuFilter className="h-4 w-4 text-muted-foreground" />
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="h-10 w-[190px] rounded-full">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilter && (
              <Button
                variant="ghost"
                className="h-10 rounded-full"
                onClick={() => setSubjectFilter("all")}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {hasActiveFilter && filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-2 text-sm text-muted-foreground">
            No plans for <span className="font-semibold text-foreground">{subjectFilter}</span> this period.
          </div>
        ) : null}

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="vibe-card flex min-h-0 flex-col overflow-hidden rounded-[1.5rem] bg-card">
            <div className="grid shrink-0 grid-cols-7 border-b border-black/5 bg-muted/20 dark:border-white/10">
              {weekLabels.map((label) => (
                <div key={label} className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
              {days.map((day) => {
                const dateKey = toDateKey(day);
                const monthMatches = day.getMonth() === activeMonth.getMonth();
                const isToday = dateKey === todayKey;
                const dayEvents = eventsByDate.get(dateKey) ?? [];
                const visibleEvents = dayEvents.slice(0, 3);
                const hiddenCount = Math.max(0, dayEvents.length - visibleEvents.length);

                return (
                  <div
                    key={dateKey}
                    role="button"
                    tabIndex={0}
                    aria-label={`Plan for ${parseDateKey(dateKey).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}` : ""}`}
                    className="group min-h-0 overflow-hidden border-b border-r border-black/5 p-2 text-left transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 dark:border-white/10"
                    onClick={() => openCreate(dateKey)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openCreate(dateKey);
                      }
                    }}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold ${
                          isToday
                            ? "bg-primary text-primary-foreground"
                            : monthMatches
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {day.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      {visibleEvents.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          className="block w-full rounded-md px-2 py-1 text-left text-[11px] leading-tight text-foreground transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                          style={{
                            backgroundColor: `color-mix(in oklab, ${getEventColor(event)} 20%, transparent)`,
                            borderLeft: `3px solid ${getEventColor(event)}`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(event);
                          }}
                        >
                          <p className="truncate font-semibold">{event.title}</p>
                          <p className="truncate text-muted-foreground">{timeLabel(event)}</p>
                        </button>
                      ))}

                      {hiddenCount > 0 && (
                        <p className="px-1 text-[11px] font-medium text-muted-foreground">
                          +{hiddenCount} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="vibe-card flex min-h-0 flex-col rounded-[1.5rem] bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-foreground">Upcoming (7 days)</h2>
            </div>

            {upcomingEvents.length === 0 ? (
              <EmptyState
                icon={LuCalendar}
                title={hasActiveFilter ? `No upcoming ${subjectFilter} plans` : "No upcoming plans"}
                description={
                  hasActiveFilter
                    ? "Try a different subject filter or create a new plan."
                    : "Create your next study plan from the month grid."
                }
                action={
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button size="sm" onClick={() => openCreate(todayKey)}>
                      <LuPlus className="mr-1 h-4 w-4" /> Add plan
                    </Button>
                    {hasActiveFilter && (
                      <Button size="sm" variant="outline" onClick={() => setSubjectFilter("all")}>
                        Show all
                      </Button>
                    )}
                  </div>
                }
              />
            ) : (
              <div className="space-y-2 overflow-y-auto pr-1">
                {upcomingEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => openEdit(event)}
                    className="group w-full rounded-xl border border-black/10 bg-muted/25 px-3 py-2 text-left transition-colors cursor-pointer hover:border-primary/35 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:border-white/15 dark:hover:bg-primary/20"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: getEventColor(event) }}
                      />
                      <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                      <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <LuPencil className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {parseDateKey(event.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      {" • "}
                      {timeLabel(event)}
                    </p>
                    {event.subject ? (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{event.subject}</p>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      <EventFormModal
        open={formOpen}
        mode={editingEvent ? "edit" : "create"}
        event={editingEvent ?? undefined}
        defaultDate={selectedDate}
        onClose={() => {
          setFormOpen(false);
          setEditingEvent(null);
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </AppLayout>
  );
}
