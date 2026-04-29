export type KanbanPriority = "low" | "medium" | "high";

export type KanbanCard = {
  id: string;
  title: string;
  subject?: string;
  notes?: string;
  estimateMinutes?: number;
  dueDate?: string;
  priority?: KanbanPriority;
  createdAt: string;
  updatedAt: string;
};

export type KanbanList = {
  id: string;
  title: string;
  cards: KanbanCard[];
  createdAt: string;
  updatedAt: string;
};

export type KanbanBoard = {
  id: string;
  title: string;
  lists: KanbanList[];
  createdAt: string;
  updatedAt: string;
};

export type NewKanbanCard = Omit<KanbanCard, "id" | "createdAt" | "updatedAt">;
