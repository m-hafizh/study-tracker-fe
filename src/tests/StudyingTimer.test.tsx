import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { StudyingTimer } from "@/pages/Study-Tracker/study-session/components/StudyingTimer";
import { useStudySessionStore } from "@/stores/useStudySessionStore";

describe("StudyingTimer", () => {
    beforeEach(() => {
        localStorage.clear();

        useStudySessionStore.setState({
            subject: "Devops",
            topic: "-",
            duration: "00:05:00",
            startTime: "10:00:00",
            endTime: "",
            isStartStudy: false,
            isStudying: true,
            isSaveStudy: false,
            isTimerActive: true,
            remainingSeconds: 300,
            note: "",
        });
    });

    it("stays paused after clicking Pause", async () => {
        render(<StudyingTimer />);

        expect(screen.getByText(/status:\s*running/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /pause/i }));

        await waitFor(() => {
            expect(useStudySessionStore.getState().isTimerActive).toBe(false);
            expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
            expect(screen.getByText(/status:\s*paused/i)).toBeInTheDocument();
        });

        const remainingAfterPause = useStudySessionStore.getState().remainingSeconds;

        await new Promise((resolve) => setTimeout(resolve, 1200));

        expect(useStudySessionStore.getState().remainingSeconds).toBe(remainingAfterPause);
        expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
    });
});