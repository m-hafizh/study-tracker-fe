import { customAxios } from '@/api';

export type StudySettings = {
  dailyTargetMinutes: number;
  updatedAt: string;
};

export const getStudySettings = async (): Promise<StudySettings> => {
  const response = await customAxios.get<StudySettings>('/settings/study');
  return response.data;
};

export const updateStudySettings = async (
  payload: Pick<StudySettings, 'dailyTargetMinutes'>
): Promise<StudySettings> => {
  const response = await customAxios.put<StudySettings>('/settings/study', payload);
  return response.data;
};
