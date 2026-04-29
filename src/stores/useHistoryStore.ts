import { create } from "zustand";
import {
    type StudySession,
    getSessions as getLocalSessions,
} from "@/services/storage";
import {
    createStudySession,
    deleteStudySession,
    getStudySessions,
    updateStudySession,
} from "@/api/study";
import {
    createOfflineSession,
    deleteOfflineSession,
    readSessionsCache,
    updateOfflineSession,
    writeSessionsCache,
} from "@/features/study/offlineSync";
import type { MutationResult } from "@/lib/form-feedback";

const isNetworkError = (error: unknown) => {
    if (!error || typeof error !== "object") return false;
    const candidate = error as { response?: unknown; code?: string };
    return !candidate.response || candidate.code === "ERR_NETWORK";
};

type HistoryState = {
    sessions: StudySession[];
    load: () => void;
    add: (session: Omit<StudySession, "id">) => Promise<MutationResult>;
    update: (id: string, data: Partial<Omit<StudySession, "id">>) => Promise<MutationResult>;
    remove: (id: string) => Promise<MutationResult>;
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
    sessions: [],

    load: () => {
        void (async () => {
            try {
                const response = await getStudySessions();
                writeSessionsCache(response.items);
                set({ sessions: response.items });
            } catch (error) {
                if (isNetworkError(error)) {
                    const cached = readSessionsCache();
                    set({ sessions: cached.length > 0 ? cached : getLocalSessions() });
                    return;
                }

                set({ sessions: getLocalSessions() });
            }
        })();
    },

    add: async (data) => {
        try {
            const created = await createStudySession(data);
            const updated = [created, ...get().sessions.filter((entry) => entry.id !== created.id)];
            writeSessionsCache(updated);
            set({ sessions: updated });
            return { ok: true };
        } catch (error) {
            if (isNetworkError(error)) {
                const updated = createOfflineSession(data);
                set({ sessions: updated });
                return { ok: true, offline: true };
            }

            return { ok: false, error };
        }
    },

    update: async (id, data) => {
        try {
            const saved = await updateStudySession(id, data);
            const updated = get().sessions.map((entry) => (entry.id === id ? saved : entry));
            writeSessionsCache(updated);
            set({ sessions: updated });
            return { ok: true };
        } catch (error) {
            if (isNetworkError(error)) {
                const updated = updateOfflineSession(id, data);
                set({ sessions: updated });
                return { ok: true, offline: true };
            }

            return { ok: false, error };
        }
    },

    remove: async (id) => {
        try {
            await deleteStudySession(id);
            const updated = get().sessions.filter((entry) => entry.id !== id);
            writeSessionsCache(updated);
            set({ sessions: updated });
            return { ok: true };
        } catch (error) {
            if (isNetworkError(error)) {
                const updated = deleteOfflineSession(id);
                set({ sessions: updated });
                return { ok: true, offline: true };
            }

            return { ok: false, error };
        }
    },
}));
