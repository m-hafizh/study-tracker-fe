import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LeaveStudySessionGuard } from "@/pages/Study-Tracker/study-session/components/LeaveStudySessionGuard";
import { Link, MemoryRouter, useLocation } from "react-router-dom";

function LocationView() {
    const location = useLocation();
    return <p data-testid="location">{location.pathname}</p>;
}

function TestHarness({ when }: { when: boolean }) {
    return (
        <MemoryRouter initialEntries={["/study-tracker/study-session"]}>
            <LeaveStudySessionGuard when={when} />
            <LocationView />
            <Link to="/study-tracker/calendar">Go Calendar</Link>
        </MemoryRouter>
    );
}

describe("LeaveStudySessionGuard", () => {
    it("does not show modal when navigation is not blocked", () => {
        render(<TestHarness when={false} />);

        expect(screen.getByTestId("location")).toHaveTextContent("/study-tracker/study-session");
    });

    it("shows confirmation modal when navigation is attempted", async () => {
        const user = userEvent.setup();

        render(<TestHarness when={true} />);
        await user.click(screen.getByRole("link", { name: /go calendar/i }));

        expect(screen.getByText("Leave active study session?")).toBeInTheDocument();
        expect(screen.getByText(/your timer is still running/i)).toBeInTheDocument();
        expect(screen.getByTestId("location")).toHaveTextContent("/study-tracker/study-session");
    });

    it("stays on the same page when user chooses stay", async () => {
        const user = userEvent.setup();

        render(<TestHarness when={true} />);
        await user.click(screen.getByRole("link", { name: /go calendar/i }));
        await user.click(screen.getByRole("button", { name: /stay here/i }));

        expect(screen.getByTestId("location")).toHaveTextContent("/study-tracker/study-session");
    });

    it("navigates when user confirms leave", async () => {
        const user = userEvent.setup();

        render(<TestHarness when={true} />);
        await user.click(screen.getByRole("link", { name: /go calendar/i }));
        await user.click(screen.getByRole("button", { name: /leave page/i }));

        expect(screen.getByTestId("location")).toHaveTextContent("/study-tracker/calendar");
    });
});
