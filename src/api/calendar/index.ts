import { customAxios } from '@/api';
import type { NewStudyPlanEvent, StudyPlanEvent } from '@/models/calendar';

export type ListCalendarEventsParams = {
  from?: string;
  to?: string;
  subject?: string;
};

export const getCalendarEvents = async (
  params: ListCalendarEventsParams = {}
): Promise<StudyPlanEvent[]> => {
  const response = await customAxios.get<StudyPlanEvent[]>('/calendar/events', { params });
  return response.data;
};

export const createCalendarEvent = async (
  payload: NewStudyPlanEvent
): Promise<StudyPlanEvent> => {
  const response = await customAxios.post<StudyPlanEvent>('/calendar/events', payload);
  return response.data;
};

export const updateCalendarEvent = async (
  id: string,
  payload: Partial<NewStudyPlanEvent>
): Promise<StudyPlanEvent> => {
  const response = await customAxios.put<StudyPlanEvent>(`/calendar/events/${id}`, payload);
  return response.data;
};

export const deleteCalendarEvent = async (id: string): Promise<void> => {
  await customAxios.delete(`/calendar/events/${id}`);
};

export const clearCalendarEvents = async (): Promise<void> => {
  await customAxios.delete('/calendar/events');
};
