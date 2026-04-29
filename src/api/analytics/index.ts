import { customAxios } from '@/api';

export type StudySummaryDay = {
  date: string;
  minutes: number;
};

export type StudySummarySubject = {
  subject: string;
  minutes: number;
};

export type StudySummary = {
  totalMinutes: number;
  totalHours: number;
  sessionsCount: number;
  currentStreakDays: number;
  weeklyMinutes: number;
  todayMinutes: number;
  dailyTargetMinutes: number;
  todayTargetProgress: number;
  topSubjects: StudySummarySubject[];
  dailyBreakdown: StudySummaryDay[];
  updatedAt: string;
};

export const getStudySummary = async (params?: { weekStart?: string }): Promise<StudySummary> => {
  const response = await customAxios.get<StudySummary>('/analytics/study-summary', { params });
  return response.data;
};
