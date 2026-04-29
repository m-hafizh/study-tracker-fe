import { useEffect, useState } from "react";
import { LuLayoutDashboard, LuPlus, LuSearch, LuX } from "react-icons/lu";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/custom/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKanbanStore } from "@/stores/useKanbanStore";
import { KanbanListColumn } from "./components/KanbanListColumn";
import type { KanbanPriority } from "@/models/kanban";
import { toast } from "sonner";

type DragData =
  | { type: "list"; listId: string }
  | { type: "card"; cardId: string; listId: string }
  | { type: "dropzone"; listId: string };

type ActiveDragState =
  | { type: "list"; listId: string }
  | { type: "card"; listId: string; cardId: string }
  | null;

const parseDragData = (value: unknown): DragData | null => {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const type = data.type;

  if (type === "list" && typeof data.listId === "string") {
    return { type: "list", listId: data.listId };
  }

  if (
    type === "card" &&
    typeof data.cardId === "string" &&
    typeof data.listId === "string"
  ) {
    return { type: "card", cardId: data.cardId, listId: data.listId };
  }

  if (type === "dropzone" && typeof data.listId === "string") {
    return { type: "dropzone", listId: data.listId };
  }

  return null;
};

export default function KanbanPage() {
  const {
    board,
    load,
    addList,
    renameList,
    deleteList,
    moveList,
    reorderLists,
    addCard,
    updateCard,
    deleteCard,
    moveCardToList,
    moveCardToIndex,
  } = useKanbanStore();

  const [newListTitle, setNewListTitle] = useState("");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | KanbanPriority>("all");
  const [dueTodayOnly, setDueTodayOnly] = useState(false);
  const [collapsedLists, setCollapsedLists] = useState<Record<string, boolean>>({});
  const [activeDrag, setActiveDrag] = useState<ActiveDragState>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    load();
  }, [load]);

  const getFallbackListTitle = () => {
    const existing = new Set(board.lists.map((list) => list.title.toLowerCase()));

    if (!existing.has("new list")) return "New List";

    let i = 2;
    while (existing.has(`new list ${i}`)) i += 1;
    return `New List ${i}`;
  };

  const createList = () => {
    const title = newListTitle.trim() || getFallbackListTitle();
    addList(title);
    setNewListTitle("");
    toast.success(`List "${title}" created.`);
  };

  const handleCreateFirstList = () => {
    addList("To Do");
    toast.success('List "To Do" created.');
  };

  const handleRenameList = (listId: string, title: string) => {
    const previous = board.lists.find((list) => list.id === listId)?.title;
    renameList(listId, title);

    const next = title.trim();
    if (next && next !== previous) {
      toast.success("List renamed.");
    }
  };

  const handleDeleteList = (listId: string) => {
    deleteList(listId);
    toast.success("List deleted.");
  };

  const handleMoveList = (listId: string, direction: "left" | "right") => {
    moveList(listId, direction);
    toast.success(`List moved ${direction}.`);
  };

  const handleDeleteCard = (listId: string, cardId: string) => {
    deleteCard(listId, cardId);
    toast.success("Task deleted.");
  };

  const handleMoveCard = (cardId: string, fromListId: string, toListId: string) => {
    moveCardToList(cardId, fromListId, toListId);
    const destinationTitle = board.lists.find((list) => list.id === toListId)?.title;
    if (destinationTitle) {
      toast.success(`Task moved to ${destinationTitle}.`);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const filteredLists = board.lists.map((list) => {
    const cards = list.cards.filter((card) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        card.title.toLowerCase().includes(query) ||
        card.subject?.toLowerCase().includes(query) ||
        card.notes?.toLowerCase().includes(query);

      const matchesPriority =
        priorityFilter === "all" || card.priority === priorityFilter;

      const matchesDueDate = !dueTodayOnly || card.dueDate === today;

      return !!matchesSearch && matchesPriority && matchesDueDate;
    });

    return { ...list, cards };
  });

  const clearFilters = () => {
    setSearch("");
    setPriorityFilter("all");
    setDueTodayOnly(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeData = parseDragData(event.active.data.current);
    if (!activeData) return;

    if (activeData.type === "list") {
      setActiveDrag({ type: "list", listId: activeData.listId });
      return;
    }

    if (activeData.type === "card") {
      setActiveDrag({
        type: "card",
        listId: activeData.listId,
        cardId: activeData.cardId,
      });
    }
  };

  const handleDragCancel = () => {
    setActiveDrag(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrag(null);
    if (!over) return;

    const activeData = parseDragData(active.data.current);
    const overData = parseDragData(over.data.current);

    if (!activeData || !overData) return;

    if (activeData.type === "list" && overData.type === "list") {
      reorderLists(activeData.listId, overData.listId);
      return;
    }

    if (activeData.type !== "card") return;

    const sourceListId = activeData.listId;
    const sourceCardId = activeData.cardId;

    if (overData.type === "card") {
      const destinationList = board.lists.find((l) => l.id === overData.listId);
      if (!destinationList) return;

      const overIndex = destinationList.cards.findIndex((c) => c.id === overData.cardId);
      if (overIndex < 0) return;

      moveCardToIndex(sourceCardId, sourceListId, overData.listId, overIndex);
      return;
    }

    if (overData.type === "list" || overData.type === "dropzone") {
      const destinationListId = overData.listId;

      if (sourceListId === destinationListId) {
        return;
      }

      moveCardToList(sourceCardId, sourceListId, destinationListId);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto flex h-[calc(100dvh-7.75rem)] w-full max-w-6xl flex-col gap-4 overflow-hidden md:h-[calc(100dvh-8.25rem)] lg:h-[calc(100dvh-9rem)]">
        <div className="vibe-card shrink-0 flex flex-wrap items-center gap-2 rounded-[1.25rem] bg-card p-3">
          <Input
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createList()}
            placeholder="Add new column (e.g. Revision)"
            className="h-10 w-full rounded-full sm:w-[320px]"
          />
          <Button className="h-10 rounded-full" onClick={createList}>
            <LuPlus className="mr-1 h-4 w-4" /> Add List
          </Button>
        </div>

    <div className="vibe-card shrink-0 flex flex-wrap items-center gap-2 rounded-[1.25rem] bg-card p-3">
          <div className="relative w-full sm:w-[280px]">
            <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, subject, notes..."
              className="h-10 rounded-full pl-9"
            />
          </div>

          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as "all" | KanbanPriority)}>
            <SelectTrigger className="h-10 w-[180px] rounded-full">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={dueTodayOnly ? "default" : "outline"}
            className="h-10 rounded-full"
            onClick={() => setDueTodayOnly((v) => !v)}
          >
            Due Today
          </Button>

          <Button variant="ghost" className="h-10 rounded-full" onClick={clearFilters}>
            <LuX className="mr-1 h-4 w-4" /> Clear
          </Button>
        </div>

        {board.lists.length === 0 ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <EmptyState
              icon={LuLayoutDashboard}
              title="No columns yet"
              description="Create your first study column to start planning your tasks."
              action={
                <Button onClick={handleCreateFirstList}>Create First List</Button>
              }
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={board.lists.map((list) => `list-${list.id}`)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="vibe-scroll-x flex h-full min-h-0 items-start gap-3 overflow-x-auto overflow-y-hidden pb-2">
                  {filteredLists.map((list, idx) => (
                    <KanbanListColumn
                      key={list.id}
                      list={list}
                      allLists={board.lists}
                      totalCardCount={board.lists.find((l) => l.id === list.id)?.cards.length ?? list.cards.length}
                      collapsed={!!collapsedLists[list.id]}
                      onToggleCollapse={() =>
                        setCollapsedLists((prev) => ({
                          ...prev,
                          [list.id]: !prev[list.id],
                        }))
                      }
                      canMoveLeft={idx > 0}
                      canMoveRight={idx < board.lists.length - 1}
                      onRenameList={handleRenameList}
                      onDeleteList={handleDeleteList}
                      onMoveList={handleMoveList}
                      onAddCard={addCard}
                      onUpdateCard={updateCard}
                      onDeleteCard={handleDeleteCard}
                      onMoveCard={handleMoveCard}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeDrag?.type === "list" ? (
                  <div className="vibe-card min-h-[90px] w-[320px] rounded-[1.5rem] bg-card p-4 opacity-90">
                    <p className="text-sm font-bold uppercase tracking-wide text-foreground">
                      {board.lists.find((l) => l.id === activeDrag.listId)?.title ?? "List"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Moving list…</p>
                  </div>
                ) : activeDrag?.type === "card" ? (
                  <div className="w-[280px] rounded-xl border border-border bg-card p-3 shadow-lg opacity-95">
                    <p className="line-clamp-2 text-sm font-semibold text-foreground">
                      {board.lists
                        .find((l) => l.id === activeDrag.listId)
                        ?.cards.find((c) => c.id === activeDrag.cardId)?.title ?? "Task"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Moving card…</p>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
