import type { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { customAxios } from '@/api';
import type { NewStudyPlanEvent, StudyPlanEvent } from '@/models/calendar';
import type { KanbanBoard } from '@/models/kanban';

const CALENDAR_CACHE_KEY = 'study-tracker:calendar-events';
const KANBAN_CACHE_KEY = 'study-tracker:kanban';
const SETTINGS_KEY = 'study-tracker:settings';
const WORKSPACE_OUTBOX_KEY = 'study-tracker:workspace-outbox';

export type WorkspaceSyncState = {
  online: boolean;
  pendingCount: number;
  syncing: boolean;
  updatedAt: string;
};

type SettingsCache = {
  dailyTargetMinutes: number;
};

type WorkspaceOutboxItem =
  | {
      id: string;
      entity: 'calendar';
      operation: 'create';
      tempId: string;
      payload: NewStudyPlanEvent;
      createdAt: string;
      retryCount: number;
    }
  | {
      id: string;
      entity: 'calendar';
      operation: 'update';
      idRef: string;
      payload: Partial<NewStudyPlanEvent>;
      createdAt: string;
      retryCount: number;
    }
  | {
      id: string;
      entity: 'calendar';
      operation: 'delete';
      idRef: string;
      createdAt: string;
      retryCount: number;
    }
  | {
      id: string;
      entity: 'calendar';
      operation: 'clear';
      createdAt: string;
      retryCount: number;
    }
  | {
      id: string;
      entity: 'kanban';
      operation: 'save';
      payload: KanbanBoard;
      createdAt: string;
      retryCount: number;
    }
  | {
      id: string;
      entity: 'kanban';
      operation: 'reset';
      createdAt: string;
      retryCount: number;
    }
  | {
      id: string;
      entity: 'settings';
      operation: 'update';
      payload: { dailyTargetMinutes: number };
      createdAt: string;
      retryCount: number;
    };

const workspaceSyncListeners = new Set<(state: WorkspaceSyncState) => void>();

let workspaceSyncState: WorkspaceSyncState = {
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingCount: 0,
  syncing: false,
  updatedAt: new Date().toISOString(),
};

const emitWorkspaceSyncState = () => {
  workspaceSyncState = {
    ...workspaceSyncState,
    updatedAt: new Date().toISOString(),
  };

  for (const listener of workspaceSyncListeners) {
    listener(workspaceSyncState);
  }
};

const updateWorkspaceSyncState = (patch: Partial<WorkspaceSyncState>) => {
  workspaceSyncState = {
    ...workspaceSyncState,
    ...patch,
  };
  emitWorkspaceSyncState();
};

export const getWorkspaceSyncState = (): WorkspaceSyncState => workspaceSyncState;

export const subscribeWorkspaceSyncState = (listener: (state: WorkspaceSyncState) => void) => {
  workspaceSyncListeners.add(listener);
  listener(workspaceSyncState);

  return () => {
    workspaceSyncListeners.delete(listener);
  };
};

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T): void => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const isNetworkError = (error: unknown) =>
  axios.isAxiosError(error) && (!error.response || error.code === 'ERR_NETWORK');

export const readCalendarCache = (): StudyPlanEvent[] =>
  readJson<StudyPlanEvent[]>(CALENDAR_CACHE_KEY, []);

export const writeCalendarCache = (items: StudyPlanEvent[]): void => {
  writeJson(CALENDAR_CACHE_KEY, items);
};

export const readKanbanCache = (): KanbanBoard | null =>
  readJson<KanbanBoard | null>(KANBAN_CACHE_KEY, null);

export const writeKanbanCache = (board: KanbanBoard): void => {
  writeJson(KANBAN_CACHE_KEY, board);
};

export const readSettingsCache = (): SettingsCache =>
  readJson<SettingsCache>(SETTINGS_KEY, { dailyTargetMinutes: 60 });

export const writeSettingsCache = (settings: SettingsCache): void => {
  writeJson(SETTINGS_KEY, settings);
};

const readOutbox = (): WorkspaceOutboxItem[] =>
  readJson<WorkspaceOutboxItem[]>(WORKSPACE_OUTBOX_KEY, []);

const writeOutbox = (items: WorkspaceOutboxItem[]) => {
  writeJson(WORKSPACE_OUTBOX_KEY, items);
  updateWorkspaceSyncState({ pendingCount: items.length });
};

const appendOutbox = (item: WorkspaceOutboxItem) => {
  const queue = readOutbox();
  queue.push(item);
  writeOutbox(queue);
};

const replaceOutboxLatest = (predicate: (entry: WorkspaceOutboxItem) => boolean, next: WorkspaceOutboxItem) => {
  const queue = readOutbox();
  const filtered = queue.filter((entry) => !predicate(entry));
  filtered.push(next);
  writeOutbox(filtered);
};

const upsertCalendar = (event: StudyPlanEvent): StudyPlanEvent[] => {
  const items = readCalendarCache();
  const index = items.findIndex((entry) => entry.id === event.id);
  if (index >= 0) items[index] = event;
  else items.push(event);

  const sorted = items.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
    const aTime = a.startTime ?? '99:99';
    const bTime = b.startTime ?? '99:99';
    return aTime.localeCompare(bTime);
  });

  writeCalendarCache(sorted);
  return sorted;
};

const removeCalendar = (id: string): StudyPlanEvent[] => {
  const items = readCalendarCache().filter((entry) => entry.id !== id);
  writeCalendarCache(items);
  return items;
};

const replaceCalendarId = (sourceId: string, target: StudyPlanEvent): StudyPlanEvent[] => {
  const items = readCalendarCache().map((entry) => (entry.id === sourceId ? target : entry));
  writeCalendarCache(items);
  return items;
};

export const createOfflineCalendarEvent = (payload: NewStudyPlanEvent): StudyPlanEvent[] => {
  const nowIso = new Date().toISOString();
  const draft: StudyPlanEvent = {
    id: `local-event-${crypto.randomUUID()}`,
    ...payload,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const items = upsertCalendar(draft);
  appendOutbox({
    id: crypto.randomUUID(),
    entity: 'calendar',
    operation: 'create',
    tempId: draft.id,
    payload,
    createdAt: nowIso,
    retryCount: 0,
  });

  return items;
};

export const updateOfflineCalendarEvent = (
  id: string,
  payload: Partial<NewStudyPlanEvent>
): StudyPlanEvent[] => {
  const found = readCalendarCache().find((entry) => entry.id === id);
  if (!found) return readCalendarCache();

  const next = upsertCalendar({
    ...found,
    ...payload,
    title: (payload.title ?? found.title).trim(),
    updatedAt: new Date().toISOString(),
  });

  appendOutbox({
    id: crypto.randomUUID(),
    entity: 'calendar',
    operation: 'update',
    idRef: id,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });

  return next;
};

export const deleteOfflineCalendarEvent = (id: string): StudyPlanEvent[] => {
  const items = removeCalendar(id);
  appendOutbox({
    id: crypto.randomUUID(),
    entity: 'calendar',
    operation: 'delete',
    idRef: id,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
  return items;
};

export const clearOfflineCalendarEvents = (): StudyPlanEvent[] => {
  writeCalendarCache([]);
  appendOutbox({
    id: crypto.randomUUID(),
    entity: 'calendar',
    operation: 'clear',
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
  return [];
};

export const queueKanbanBoardSave = (payload: KanbanBoard): void => {
  writeKanbanCache(payload);
  replaceOutboxLatest(
    (entry) => entry.entity === 'kanban',
    {
      id: crypto.randomUUID(),
      entity: 'kanban',
      operation: 'save',
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    }
  );
};

export const queueKanbanBoardReset = (payload: KanbanBoard): void => {
  writeKanbanCache(payload);
  replaceOutboxLatest(
    (entry) => entry.entity === 'kanban',
    {
      id: crypto.randomUUID(),
      entity: 'kanban',
      operation: 'reset',
      createdAt: new Date().toISOString(),
      retryCount: 0,
    }
  );
};

export const queueSettingsUpdate = (dailyTargetMinutes: number): void => {
  writeSettingsCache({ dailyTargetMinutes });
  replaceOutboxLatest(
    (entry) => entry.entity === 'settings',
    {
      id: crypto.randomUUID(),
      entity: 'settings',
      operation: 'update',
      payload: { dailyTargetMinutes },
      createdAt: new Date().toISOString(),
      retryCount: 0,
    }
  );
};

let syncInProgress = false;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => updateWorkspaceSyncState({ online: true }));
  window.addEventListener('offline', () => updateWorkspaceSyncState({ online: false }));
  updateWorkspaceSyncState({ pendingCount: readOutbox().length, online: navigator.onLine });
}

export const syncWorkspaceOutbox = async (queryClient?: QueryClient): Promise<void> => {
  if (syncInProgress || !navigator.onLine) return;

  const queue = readOutbox();
  if (queue.length === 0) return;

  syncInProgress = true;
  updateWorkspaceSyncState({ syncing: true, online: true });
  const nextQueue: WorkspaceOutboxItem[] = [];
  const calendarIdMap = new Map<string, string>();

  try {
    for (const item of queue) {
      try {
        if (item.entity === 'calendar') {
          if (item.operation === 'create') {
            const response = await customAxios.post<StudyPlanEvent>('/calendar/events', item.payload);
            replaceCalendarId(item.tempId, response.data);
            calendarIdMap.set(item.tempId, response.data.id);
            continue;
          }

          if (item.operation === 'update') {
            const targetId = calendarIdMap.get(item.idRef) ?? item.idRef;
            const response = await customAxios.put<StudyPlanEvent>(`/calendar/events/${targetId}`, item.payload);
            upsertCalendar(response.data);
            continue;
          }

          if (item.operation === 'delete') {
            const targetId = calendarIdMap.get(item.idRef) ?? item.idRef;
            await customAxios.delete(`/calendar/events/${targetId}`);
            removeCalendar(targetId);
            continue;
          }

          await customAxios.delete('/calendar/events');
          writeCalendarCache([]);
          continue;
        }

        if (item.entity === 'kanban') {
          if (item.operation === 'save') {
            const response = await customAxios.put<KanbanBoard>('/kanban/board', item.payload);
            writeKanbanCache(response.data);
            continue;
          }

          const response = await customAxios.post<KanbanBoard>('/kanban/board/reset');
          writeKanbanCache(response.data);
          continue;
        }

        await customAxios.put('/settings/study', item.payload);
        writeSettingsCache(item.payload);
      } catch (error) {
        if (isNetworkError(error)) {
          nextQueue.push({ ...item, retryCount: item.retryCount + 1 });
          continue;
        }
      }
    }

    writeOutbox(nextQueue);

    if (queryClient) {
      await queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      await queryClient.invalidateQueries({ queryKey: ['kanban-board'] });
      await queryClient.invalidateQueries({ queryKey: ['study-settings'] });
    }
  } finally {
    syncInProgress = false;
    updateWorkspaceSyncState({ syncing: false, pendingCount: readOutbox().length, online: navigator.onLine });
  }
};
