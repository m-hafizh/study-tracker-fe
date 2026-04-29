import { customAxios } from '@/api';
import type { KanbanBoard } from '@/models/kanban';

export const getKanbanBoard = async (): Promise<KanbanBoard> => {
  const response = await customAxios.get<KanbanBoard>('/kanban/board');
  return response.data;
};

export const saveKanbanBoard = async (payload: KanbanBoard): Promise<KanbanBoard> => {
  const response = await customAxios.put<KanbanBoard>('/kanban/board', payload);
  return response.data;
};

export const resetKanbanBoard = async (): Promise<KanbanBoard> => {
  const response = await customAxios.post<KanbanBoard>('/kanban/board/reset');
  return response.data;
};
