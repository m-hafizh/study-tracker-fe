import { create } from "zustand";
import { getStudySettings, updateStudySettings } from "@/api/settings";
import {
    queueSettingsUpdate,
    readSettingsCache,
    writeSettingsCache,
} from "@/features/workspace/offlineSync";

const isNetworkError = (error: unknown) => {
    if (!error || typeof error !== "object") return false;
    const candidate = error as { response?: unknown; code?: string };
    return !candidate.response || candidate.code === "ERR_NETWORK";
};

type Settings = {
    dailyTargetMinutes: number;
};

type SettingsState = Settings & {
    load: () => void;
    setDailyTarget: (minutes: number) => void;
};

function read(): Settings {
    return readSettingsCache();
}

function write(settings: Settings) {
    writeSettingsCache(settings);
}

export const useSettingsStore = create<SettingsState>((set) => ({
    dailyTargetMinutes: 60,

    load: () => {
        void (async () => {
            try {
                const response = await getStudySettings();
                write({ dailyTargetMinutes: response.dailyTargetMinutes });
                set({ dailyTargetMinutes: response.dailyTargetMinutes });
            } catch (error) {
                if (isNetworkError(error)) {
                    const s = read();
                    set({ dailyTargetMinutes: s.dailyTargetMinutes });
                    return;
                }

                const s = read();
                set({ dailyTargetMinutes: s.dailyTargetMinutes });
            }
        })();
    },

    setDailyTarget: (minutes: number) => {
        const clamped = Math.max(1, minutes);
        write({ ...read(), dailyTargetMinutes: clamped });
        set({ dailyTargetMinutes: clamped });

        void (async () => {
            try {
                const response = await updateStudySettings({ dailyTargetMinutes: clamped });
                write({ dailyTargetMinutes: response.dailyTargetMinutes });
                set({ dailyTargetMinutes: response.dailyTargetMinutes });
            } catch (error) {
                if (isNetworkError(error)) {
                    queueSettingsUpdate(clamped);
                }
            }
        })();
    },
}));
