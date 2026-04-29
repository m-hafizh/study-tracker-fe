import { customAxios } from '@/api';
import type { StudySession, Subject } from '@/services/storage';

export type ListStudySessionsParams = {
  from?: string;
  to?: string;
  subject?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type ListStudySessionsResponse = {
  items: StudySession[];
  total: number;
};

export const getStudySessions = async (
  params: ListStudySessionsParams = {}
): Promise<ListStudySessionsResponse> => {
  const response = await customAxios.get<ListStudySessionsResponse>('/study-sessions', {
    params,
  });

  return response.data;
};

export const createStudySession = async (
  payload: Omit<StudySession, 'id'>
): Promise<StudySession> => {
  const response = await customAxios.post<StudySession>('/study-sessions', payload);
  return response.data;
};

export const updateStudySession = async (
  id: string,
  payload: Partial<Omit<StudySession, 'id'>>
): Promise<StudySession> => {
  const response = await customAxios.put<StudySession>(`/study-sessions/${id}`, payload);
  return response.data;
};

export const deleteStudySession = async (id: string): Promise<void> => {
  await customAxios.delete(`/study-sessions/${id}`);
};

export const getSubjects = async (): Promise<Subject[]> => {
  const response = await customAxios.get<Subject[]>('/subjects');
  return response.data;
};

export const createSubject = async (payload: Omit<Subject, 'id'>): Promise<Subject> => {
  const response = await customAxios.post<Subject>('/subjects', payload);
  return response.data;
};

export const updateSubject = async (
  id: string,
  payload: Partial<Omit<Subject, 'id'>>
): Promise<Subject> => {
  const response = await customAxios.put<Subject>(`/subjects/${id}`, payload);
  return response.data;
};

export const deleteSubject = async (id: string): Promise<void> => {
  await customAxios.delete(`/subjects/${id}`);
};
