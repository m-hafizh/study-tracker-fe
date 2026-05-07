import type { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { customAxios } from '@/api';
import type { StudySession, Subject } from '@/services/storage';
import { createUuid } from '@/utils/uuid';

const SESSIONS_CACHE_KEY = 'study-tracker:sessions';
const SUBJECTS_CACHE_KEY = 'study-tracker:subjects';
const STUDY_OUTBOX_KEY = 'study-tracker:study-outbox';

type StudyOutboxItem =
  | {
      id: string;
      entity: 'session';
      operation: 'create';
      tempId: string;
      payload: Omit<StudySession, 'id'>;
      createdAt: string;
      retryCount: number;
    }
  | {
      id: string;
      entity: 'session';
      operation: 'update';
      idRef: string;
      payload: Partial<Omit<StudySession, 'id'>>;
      createdAt: string;
      retryCount: number;
    }
  | {
      id: string;
      entity: 'session';
      operation: 'delete';
      idRef: string;
      createdAt: string;
      retryCount: number;
    }
  | {
      id: string;
      entity: 'subject';
      operation: 'create';
      tempId: string;
      payload: Omit<Subject, 'id'>;
      createdAt: string;
      retryCount: number;
    }
  | {
      id: string;
      entity: 'subject';
      operation: 'update';
      idRef: string;
      payload: Partial<Omit<Subject, 'id'>>;
      createdAt: string;
      retryCount: number;
    }
  | {
      id: string;
      entity: 'subject';
      operation: 'delete';
      idRef: string;
      createdAt: string;
      retryCount: number;
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

const readOutbox = (): StudyOutboxItem[] => readJson<StudyOutboxItem[]>(STUDY_OUTBOX_KEY, []);
const writeOutbox = (items: StudyOutboxItem[]) => writeJson(STUDY_OUTBOX_KEY, items);
const appendOutbox = (item: StudyOutboxItem) => {
  const queue = readOutbox();
  queue.push(item);
  writeOutbox(queue);
};

export const readSessionsCache = (): StudySession[] => readJson<StudySession[]>(SESSIONS_CACHE_KEY, []);
export const writeSessionsCache = (items: StudySession[]): void => writeJson(SESSIONS_CACHE_KEY, items);

export const readSubjectsCache = (): Subject[] => readJson<Subject[]>(SUBJECTS_CACHE_KEY, []);
export const writeSubjectsCache = (items: Subject[]): void => writeJson(SUBJECTS_CACHE_KEY, items);

const upsertSession = (session: StudySession): StudySession[] => {
  const items = readSessionsCache();
  const index = items.findIndex((entry) => entry.id === session.id);
  if (index >= 0) items[index] = session;
  else items.unshift(session);
  writeSessionsCache(items);
  return items;
};

const removeSession = (id: string): StudySession[] => {
  const items = readSessionsCache().filter((entry) => entry.id !== id);
  writeSessionsCache(items);
  return items;
};

const replaceSessionId = (sourceId: string, target: StudySession): StudySession[] => {
  const items = readSessionsCache().map((entry) => (entry.id === sourceId ? target : entry));
  writeSessionsCache(items);
  return items;
};

const upsertSubject = (item: Subject): Subject[] => {
  const items = readSubjectsCache();
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index >= 0) items[index] = item;
  else items.push(item);
  writeSubjectsCache(items);
  return items;
};

const removeSubject = (id: string): Subject[] => {
  const items = readSubjectsCache().filter((entry) => entry.id !== id);
  writeSubjectsCache(items);
  return items;
};

const replaceSubjectId = (sourceId: string, target: Subject): Subject[] => {
  const items = readSubjectsCache().map((entry) => (entry.id === sourceId ? target : entry));
  writeSubjectsCache(items);
  return items;
};

export const createOfflineSession = (payload: Omit<StudySession, 'id'>): StudySession[] => {
  const draft: StudySession = {
    id: `local-session-${createUuid()}`,
    ...payload,
  };

  const items = upsertSession(draft);
  appendOutbox({
    id: createUuid(),
    entity: 'session',
    operation: 'create',
    tempId: draft.id,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });

  return items;
};

export const updateOfflineSession = (
  id: string,
  payload: Partial<Omit<StudySession, 'id'>>
): StudySession[] => {
  const items = readSessionsCache();
  const found = items.find((entry) => entry.id === id);
  if (!found) return items;

  const next = upsertSession({ ...found, ...payload });
  appendOutbox({
    id: createUuid(),
    entity: 'session',
    operation: 'update',
    idRef: id,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });

  return next;
};

export const deleteOfflineSession = (id: string): StudySession[] => {
  const items = removeSession(id);
  appendOutbox({
    id: createUuid(),
    entity: 'session',
    operation: 'delete',
    idRef: id,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
  return items;
};

export const createOfflineSubject = (payload: Omit<Subject, 'id'>): Subject[] => {
  const draft: Subject = {
    id: `local-subject-${createUuid()}`,
    ...payload,
  };

  const items = upsertSubject(draft);
  appendOutbox({
    id: createUuid(),
    entity: 'subject',
    operation: 'create',
    tempId: draft.id,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });

  return items;
};

export const updateOfflineSubject = (
  id: string,
  payload: Partial<Omit<Subject, 'id'>>
): Subject[] => {
  const items = readSubjectsCache();
  const found = items.find((entry) => entry.id === id);
  if (!found) return items;

  const next = upsertSubject({ ...found, ...payload });
  appendOutbox({
    id: createUuid(),
    entity: 'subject',
    operation: 'update',
    idRef: id,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });

  return next;
};

export const deleteOfflineSubject = (id: string): Subject[] => {
  const items = removeSubject(id);
  appendOutbox({
    id: createUuid(),
    entity: 'subject',
    operation: 'delete',
    idRef: id,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });

  return items;
};

let syncInProgress = false;

export const syncStudyOutbox = async (queryClient?: QueryClient): Promise<void> => {
  if (syncInProgress || !navigator.onLine) return;

  const queue = readOutbox();
  if (queue.length === 0) return;

  syncInProgress = true;
  const nextQueue: StudyOutboxItem[] = [];
  const idMap = new Map<string, string>();

  try {
    for (const item of queue) {
      const resolvedId =
        'idRef' in item ? idMap.get(item.idRef) ?? item.idRef : idMap.get(item.tempId) ?? item.tempId;

      try {
        if (item.entity === 'session') {
          if (item.operation === 'create') {
            const response = await customAxios.post<StudySession>('/study-sessions', item.payload);
            replaceSessionId(item.tempId, response.data);
            idMap.set(item.tempId, response.data.id);
            continue;
          }

          if (item.operation === 'update') {
            const response = await customAxios.put<StudySession>(`/study-sessions/${resolvedId}`, item.payload);
            upsertSession(response.data);
            continue;
          }

          await customAxios.delete(`/study-sessions/${resolvedId}`);
          removeSession(resolvedId);
          continue;
        }

        if (item.operation === 'create') {
          const response = await customAxios.post<Subject>('/subjects', item.payload);
          replaceSubjectId(item.tempId, response.data);
          idMap.set(item.tempId, response.data.id);
          continue;
        }

        if (item.operation === 'update') {
          const response = await customAxios.put<Subject>(`/subjects/${resolvedId}`, item.payload);
          upsertSubject(response.data);
          continue;
        }

        await customAxios.delete(`/subjects/${resolvedId}`);
        removeSubject(resolvedId);
      } catch (error) {
        if (isNetworkError(error)) {
          nextQueue.push({ ...item, retryCount: item.retryCount + 1 });
          continue;
        }
      }
    }

    writeOutbox(nextQueue);
    if (queryClient) {
      await queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      await queryClient.invalidateQueries({ queryKey: ['subjects'] });
    }
  } finally {
    syncInProgress = false;
  }
};
