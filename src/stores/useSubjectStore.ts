import { create } from "zustand";
import {
    type Subject,
    getSubjects as getLocalSubjects,
} from "@/services/storage";
import {
    createSubject,
    deleteSubject,
    getSubjects,
    updateSubject,
} from "@/api/study";
import {
    createOfflineSubject,
    deleteOfflineSubject,
    readSubjectsCache,
    updateOfflineSubject,
    writeSubjectsCache,
} from "@/features/study/offlineSync";
import type { MutationResult } from "@/lib/form-feedback";

const isNetworkError = (error: unknown) => {
    if (!error || typeof error !== "object") return false;
    const candidate = error as { response?: unknown; code?: string };
    return !candidate.response || candidate.code === "ERR_NETWORK";
};

type SubjectState = {
    subjects: Subject[];
    load: () => void;
    add: (subject: Omit<Subject, "id">) => Promise<MutationResult>;
    update: (id: string, data: Partial<Omit<Subject, "id">>) => Promise<MutationResult>;
    remove: (id: string) => Promise<MutationResult>;
};

export const useSubjectStore = create<SubjectState>((set, get) => ({
    subjects: [],

    load: () => {
        void (async () => {
            try {
                const items = await getSubjects();
                writeSubjectsCache(items);
                set({ subjects: items });
            } catch (error) {
                if (isNetworkError(error)) {
                    const cached = readSubjectsCache();
                    set({ subjects: cached.length > 0 ? cached : getLocalSubjects() });
                    return;
                }

                set({ subjects: getLocalSubjects() });
            }
        })();
    },

    add: async (data) => {
        try {
            const created = await createSubject(data);
            const updated = [...get().subjects.filter((entry) => entry.id !== created.id), created];
            writeSubjectsCache(updated);
            set({ subjects: updated });
            return { ok: true };
        } catch (error) {
            if (isNetworkError(error)) {
                const updated = createOfflineSubject(data);
                set({ subjects: updated });
                return { ok: true, offline: true };
            }

            return { ok: false, error };
        }
    },

    update: async (id, data) => {
        try {
            const saved = await updateSubject(id, data);
            const updated = get().subjects.map((entry) => (entry.id === id ? saved : entry));
            writeSubjectsCache(updated);
            set({ subjects: updated });
            return { ok: true };
        } catch (error) {
            if (isNetworkError(error)) {
                const updated = updateOfflineSubject(id, data);
                set({ subjects: updated });
                return { ok: true, offline: true };
            }

            return { ok: false, error };
        }
    },

    remove: async (id) => {
        try {
            await deleteSubject(id);
            const updated = get().subjects.filter((entry) => entry.id !== id);
            writeSubjectsCache(updated);
            set({ subjects: updated });
            return { ok: true };
        } catch (error) {
            if (isNetworkError(error)) {
                const updated = deleteOfflineSubject(id);
                set({ subjects: updated });
                return { ok: true, offline: true };
            }

            return { ok: false, error };
        }
    },
}));
