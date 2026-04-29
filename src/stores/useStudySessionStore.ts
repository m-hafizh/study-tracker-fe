import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { timeToSeconds } from "@/utils/time"

type StudySessionState = {
    subject: string
    topic?: string
    duration: string
    startTime?: string
    endTime?: string
    isStartStudy?: boolean
    isStudying?: boolean
    isSaveStudy?: boolean
    isTimerActive?: boolean
    remainingSeconds?: number
    note?: string
    createdAt?: Date | string
}

type StudySessionAction = {
    saveAndStartStudySession: (data: StudySessionState) => void
    updateStudySession: (data: Partial<StudySessionState>) => void
}

export const useStudySessionStore = create<StudySessionState & StudySessionAction>()(
    persist(
        (set) => ({
            subject: "",
            topic: "",
            duration: "",
            note: "",
            startTime: "",
            endTime: "",
            isStartStudy: true, // default to true to show the start form initially
            isStudying: false,
            isSaveStudy: false,
            isTimerActive: false,
            remainingSeconds: 0,



            updateStudySession: (data: Partial<StudySessionState>) => {
                set((state) => ({ ...state, ...data }));

        // localStorage.setItem('studySession', JSON.stringify({
        //     endTime: new Date().toLocaleTimeString(),
        // }));
        },

            saveAndStartStudySession: (data: StudySessionState) => {
                // Implementation for saving and starting a study session

                if (data) {

                    // If isSaveStudy is true, only update the note
                    if (data.isSaveStudy === true) {
                        set({
                            note: data.note,
                        })

                // localStorage.setItem('studySession', JSON.stringify({
                    
                //     note: data.note,
                // }));

                        return;
                    }

                    set({
                        subject: data.subject,
                        topic: data.topic,
                        duration: data.duration,
                        startTime: new Date().toLocaleTimeString(),
                        createdAt: new Date().toLocaleString(),
                        endTime: "",
                        isTimerActive: true,
                        remainingSeconds: timeToSeconds(data.duration),
                    });

            // localStorage.setItem('studySession', JSON.stringify({
            //     subject: data.subject,
            //     topic: data.topic,
            //     duration: data.duration,
            //     startTime: new Date().toLocaleTimeString(),
            //     createdAt: new Date().toLocaleString(),
            // }));

            // console.log('Study session started with provided data!')
            // console.log('Study session started!')

                    return;
                }
            }
        }),
        {
            name: "study-session-store",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                subject: state.subject,
                topic: state.topic,
                duration: state.duration,
                startTime: state.startTime,
                endTime: state.endTime,
                isStartStudy: state.isStartStudy,
                isStudying: state.isStudying,
                isSaveStudy: state.isSaveStudy,
                isTimerActive: state.isTimerActive,
                remainingSeconds: state.remainingSeconds,
                note: state.note,
                createdAt: state.createdAt,
            }),
        }
    )
)
