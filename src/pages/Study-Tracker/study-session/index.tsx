import { AppLayout } from "@/components/layout/AppLayout";
import { StartStudyForm } from "./components/StartStudyForm";
import { StudyingTimer } from "./components/StudyingTimer";
import { useStudySessionStore } from "@/stores/useStudySessionStore";
import { SaveStudyForm } from "./components/SaveStudyForm";
import { LeaveStudySessionGuard } from "./components/LeaveStudySessionGuard";

export default function StudySession() {
    const { isStartStudy, isStudying, isSaveStudy } = useStudySessionStore();

    return (
        <AppLayout>
            <LeaveStudySessionGuard when={Boolean(isStudying)} />
            <div className="flex flex-col items-center justify-center pt-8">
                {isStartStudy && !isStudying && !isSaveStudy && <StartStudyForm />}
                {!isStartStudy && isStudying && !isSaveStudy && <StudyingTimer />}
                {!isStartStudy && !isStudying && isSaveStudy && <SaveStudyForm />}
            </div>
        </AppLayout>
    );
}