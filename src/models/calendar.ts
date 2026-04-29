export type StudyPlanEvent = {
  id: string;
  title: string;
  subject?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  allDay: boolean;
  color?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type NewStudyPlanEvent = Omit<
  StudyPlanEvent,
  "id" | "createdAt" | "updatedAt"
>;
