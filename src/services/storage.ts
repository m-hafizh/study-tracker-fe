// ── Generic localStorage helpers ──────────────────────────────────────

function getItem<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
}

// ── Subject ──────────────────────────────────────────────────────────

export type Subject = {
    id: string;
    subject: string;
    color: string;
};

const SUBJECTS_KEY = "study-tracker:subjects";

const DEFAULT_SUBJECTS: Subject[] = [
    { id: "1", subject: "English", color: "#bada55" },
    { id: "2", subject: "JavaScript", color: "#f0db4f" },
    { id: "3", subject: "Japanese", color: "#e34c26" },
    { id: "4", subject: "Vue.js", color: "#42b883" },
    { id: "5", subject: "Math", color: "#264de4" },
    { id: "6", subject: "React", color: "#61dafb" },
];

export function getSubjects(): Subject[] {
    const items = getItem<Subject[]>(SUBJECTS_KEY, []);
    if (items.length === 0) {
        // seed default data on first visit
        setItem(SUBJECTS_KEY, DEFAULT_SUBJECTS);
        return DEFAULT_SUBJECTS;
    }
    return items;
}

export function saveSubjects(subjects: Subject[]): void {
    setItem(SUBJECTS_KEY, subjects);
}

// ── Study Session (History) ──────────────────────────────────────────

export type StudySession = {
    id: string;
    subject: string;
    topic: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    date: string;       // YYYY-MM-DD
    notes: string;
};

const SESSIONS_KEY = "study-tracker:sessions";

export function getSessions(): StudySession[] {
    return getItem<StudySession[]>(SESSIONS_KEY, []);
}

export function saveSessions(sessions: StudySession[]): void {
    setItem(SESSIONS_KEY, sessions);
}
