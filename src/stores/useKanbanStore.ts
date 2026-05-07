import { create } from "zustand";
import type { KanbanBoard, KanbanCard, KanbanList, NewKanbanCard } from "@/models/kanban";
import { getKanbanBoard, resetKanbanBoard, saveKanbanBoard } from "@/api/kanban";
import {
  queueKanbanBoardReset,
  queueKanbanBoardSave,
  readKanbanCache,
  writeKanbanCache,
} from "@/features/workspace/offlineSync";
import { createUuid } from "@/utils/uuid";

const now = () => new Date().toISOString();

const isNetworkError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { response?: unknown; code?: string };
  return !candidate.response || candidate.code === "ERR_NETWORK";
};

function seedBoard(): KanbanBoard {
  const timestamp = now();
  return {
    id: createUuid(),
    title: "Study Planner",
    createdAt: timestamp,
    updatedAt: timestamp,
    lists: [
      { id: createUuid(), title: "To Do", cards: [], createdAt: timestamp, updatedAt: timestamp },
      { id: createUuid(), title: "In Progress", cards: [], createdAt: timestamp, updatedAt: timestamp },
      { id: createUuid(), title: "Done", cards: [], createdAt: timestamp, updatedAt: timestamp },
    ],
  };
}

function readBoard(): KanbanBoard {
  const cached = readKanbanCache();
  if (cached?.lists?.length) return cached;
  return seedBoard();
}

function saveBoard(board: KanbanBoard) {
  writeKanbanCache(board);
}

type KanbanState = {
  board: KanbanBoard;
  load: () => void;
  resetBoard: () => void;
  renameBoard: (title: string) => void;

  addList: (title: string) => void;
  renameList: (listId: string, title: string) => void;
  deleteList: (listId: string) => void;
  moveList: (listId: string, direction: "left" | "right") => void;
  reorderLists: (activeListId: string, overListId: string) => void;

  addCard: (listId: string, data: NewKanbanCard) => void;
  updateCard: (listId: string, cardId: string, data: Partial<NewKanbanCard>) => void;
  deleteCard: (listId: string, cardId: string) => void;
  moveCardToList: (cardId: string, fromListId: string, toListId: string) => void;
  moveCardToIndex: (cardId: string, fromListId: string, toListId: string, toIndex: number) => void;
};

export const useKanbanStore = create<KanbanState>((set, get) => {
  const persistBoard = (updated: KanbanBoard) => {
    saveBoard(updated);
    set({ board: updated });

    void (async () => {
      try {
        const saved = await saveKanbanBoard(updated);
        saveBoard(saved);
        set({ board: saved });
      } catch (error) {
        if (isNetworkError(error)) {
          queueKanbanBoardSave(updated);
        }
      }
    })();
  };

  return {
    board: seedBoard(),

    load: () => {
      void (async () => {
        try {
          const board = await getKanbanBoard();
          saveBoard(board);
          set({ board });
        } catch (error) {
          if (isNetworkError(error)) {
            set({ board: readBoard() });
            return;
          }

          set({ board: readBoard() });
        }
      })();
    },

    resetBoard: () => {
      void (async () => {
        try {
          const board = await resetKanbanBoard();
          saveBoard(board);
          set({ board });
        } catch (error) {
          const board = seedBoard();
          saveBoard(board);
          set({ board });

          if (isNetworkError(error)) {
            queueKanbanBoardReset(board);
          }
        }
      })();
    },

    renameBoard: (title) => {
      const value = title.trim();
      if (!value) return;

      const updated: KanbanBoard = {
        ...get().board,
        title: value,
        updatedAt: now(),
      };

      persistBoard(updated);
    },

    addList: (title) => {
      const value = title.trim();
      if (!value) return;

      const list: KanbanList = {
        id: createUuid(),
        title: value,
        cards: [],
        createdAt: now(),
        updatedAt: now(),
      };

      const updated: KanbanBoard = {
        ...get().board,
        lists: [...get().board.lists, list],
        updatedAt: now(),
      };

      persistBoard(updated);
    },

    renameList: (listId, title) => {
      const value = title.trim();
      if (!value) return;

      const updated: KanbanBoard = {
        ...get().board,
        lists: get().board.lists.map((list) =>
          list.id === listId ? { ...list, title: value, updatedAt: now() } : list
        ),
        updatedAt: now(),
      };

      persistBoard(updated);
    },

    deleteList: (listId) => {
      const { lists } = get().board;
      if (lists.length <= 1) return;

      const updated: KanbanBoard = {
        ...get().board,
        lists: lists.filter((list) => list.id !== listId),
        updatedAt: now(),
      };

      persistBoard(updated);
    },

    moveList: (listId, direction) => {
      const lists = [...get().board.lists];
      const index = lists.findIndex((l) => l.id === listId);
      if (index < 0) return;

      const target = direction === "left" ? index - 1 : index + 1;
      if (target < 0 || target >= lists.length) return;

      [lists[index], lists[target]] = [lists[target], lists[index]];

      const updated: KanbanBoard = {
        ...get().board,
        lists,
        updatedAt: now(),
      };

      persistBoard(updated);
    },

    reorderLists: (activeListId, overListId) => {
      if (activeListId === overListId) return;

      const lists = [...get().board.lists];
      const fromIndex = lists.findIndex((list) => list.id === activeListId);
      const toIndex = lists.findIndex((list) => list.id === overListId);

      if (fromIndex < 0 || toIndex < 0) return;

      const [moved] = lists.splice(fromIndex, 1);
      lists.splice(toIndex, 0, moved);

      const updated: KanbanBoard = {
        ...get().board,
        lists,
        updatedAt: now(),
      };

      persistBoard(updated);
    },

    addCard: (listId, data) => {
      const title = data.title.trim();
      if (!title) return;

      const card: KanbanCard = {
        id: createUuid(),
        title,
        subject: data.subject?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        estimateMinutes: data.estimateMinutes,
        dueDate: data.dueDate,
        priority: data.priority,
        createdAt: now(),
        updatedAt: now(),
      };

      const updated: KanbanBoard = {
        ...get().board,
        lists: get().board.lists.map((list) =>
          list.id === listId
            ? { ...list, cards: [card, ...list.cards], updatedAt: now() }
            : list
        ),
        updatedAt: now(),
      };

      persistBoard(updated);
    },

    updateCard: (listId, cardId, data) => {
      const updated: KanbanBoard = {
        ...get().board,
        lists: get().board.lists.map((list) => {
          if (list.id !== listId) return list;

          return {
            ...list,
            updatedAt: now(),
            cards: list.cards.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    ...data,
                    title: (data.title ?? card.title).trim(),
                    subject:
                      data.subject !== undefined
                        ? data.subject.trim() || undefined
                        : card.subject,
                    notes:
                      data.notes !== undefined
                        ? data.notes.trim() || undefined
                        : card.notes,
                    updatedAt: now(),
                  }
                : card
            ),
          };
        }),
        updatedAt: now(),
      };

      persistBoard(updated);
    },

    deleteCard: (listId, cardId) => {
      const updated: KanbanBoard = {
        ...get().board,
        lists: get().board.lists.map((list) =>
          list.id === listId
            ? { ...list, cards: list.cards.filter((c) => c.id !== cardId), updatedAt: now() }
            : list
        ),
        updatedAt: now(),
      };

      persistBoard(updated);
    },

    moveCardToList: (cardId, fromListId, toListId) => {
      if (fromListId === toListId) return;

      const fromList = get().board.lists.find((l) => l.id === fromListId);
      const card = fromList?.cards.find((c) => c.id === cardId);
      if (!card) return;

      const updatedCard: KanbanCard = { ...card, updatedAt: now() };

      const updated: KanbanBoard = {
        ...get().board,
        lists: get().board.lists.map((list) => {
          if (list.id === fromListId) {
            return {
              ...list,
              updatedAt: now(),
              cards: list.cards.filter((c) => c.id !== cardId),
            };
          }

          if (list.id === toListId) {
            return {
              ...list,
              updatedAt: now(),
              cards: [updatedCard, ...list.cards],
            };
          }

          return list;
        }),
        updatedAt: now(),
      };

      persistBoard(updated);
    },

    moveCardToIndex: (cardId, fromListId, toListId, toIndex) => {
      const board = get().board;
      const sourceList = board.lists.find((l) => l.id === fromListId);
      const targetList = board.lists.find((l) => l.id === toListId);

      if (!sourceList || !targetList) return;

      const sourceCards = [...sourceList.cards];
      const movingCardIndex = sourceCards.findIndex((c) => c.id === cardId);
      if (movingCardIndex < 0) return;

      const [movingCard] = sourceCards.splice(movingCardIndex, 1);
      const movedCard: KanbanCard = { ...movingCard, updatedAt: now() };

      const destinationCards = fromListId === toListId ? sourceCards : [...targetList.cards];

      let insertIndex = Math.max(0, Math.min(toIndex, destinationCards.length));

      if (fromListId === toListId && movingCardIndex < insertIndex) {
        insertIndex -= 1;
      }

      destinationCards.splice(insertIndex, 0, movedCard);

      const updated: KanbanBoard = {
        ...board,
        lists: board.lists.map((list) => {
          if (list.id === fromListId && list.id === toListId) {
            return {
              ...list,
              cards: destinationCards,
              updatedAt: now(),
            };
          }

          if (list.id === fromListId) {
            return {
              ...list,
              cards: sourceCards,
              updatedAt: now(),
            };
          }

          if (list.id === toListId) {
            return {
              ...list,
              cards: destinationCards,
              updatedAt: now(),
            };
          }

          return list;
        }),
        updatedAt: now(),
      };

      persistBoard(updated);
    },
  };
});
