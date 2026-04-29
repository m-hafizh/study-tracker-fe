import { useMemo, useState } from "react";
import { LuArrowLeft, LuArrowRight, LuChevronDown, LuChevronUp, LuGripVertical, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { KanbanCard, KanbanList, NewKanbanCard } from "@/models/kanban";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KanbanCardDialog } from "./KanbanCardDialog";

const priorityColor = {
  low: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  high: "bg-red-500/10 text-red-600 dark:text-red-300",
};

const destructiveListPattern = /\b(done|archive|archived|complete|completed|closed)\b/i;

const isDestructiveTransitionTarget = (title: string) => destructiveListPattern.test(title.trim());

function SortableCard({
  card,
  list,
  availableMoveTargets,
  onDeleteCard,
  onMoveCard,
  onEdit,
}: {
  card: KanbanCard;
  list: KanbanList;
  availableMoveTargets: KanbanList[];
  onDeleteCard: (listId: string, cardId: string) => void | Promise<void>;
  onMoveCard: (cardId: string, fromListId: string, toListId: string) => void | Promise<void>;
  onEdit: (card: KanbanCard) => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmMoveOpen, setConfirmMoveOpen] = useState(false);
  const [pendingMoveTarget, setPendingMoveTarget] = useState<KanbanList | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    attributes,
    listeners,
  } = useSortable({
    id: `card-${card.id}`,
    data: { type: "card", cardId: card.id, listId: list.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const handleMoveCard = (toListId: string) => {
    const targetList = availableMoveTargets.find((target) => target.id === toListId);
    if (!targetList) return;

    if (isDestructiveTransitionTarget(targetList.title)) {
      setPendingMoveTarget(targetList);
      setConfirmMoveOpen(true);
      return;
    }

    onMoveCard(card.id, list.id, toListId);
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-border bg-background/70 p-3 shadow-sm">
      <div className="mb-1 flex items-start justify-between gap-2">
        <h4 className="line-clamp-2 text-sm font-semibold text-foreground">{card.title}</h4>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <LuGripVertical className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteOpen(true)}>
            <LuTrash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        {card.subject && <p>📚 {card.subject}</p>}
        {typeof card.estimateMinutes === "number" && <p>⏱ {card.estimateMinutes} min</p>}
        {card.dueDate && <p>📅 {card.dueDate}</p>}
        {card.priority && (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityColor[card.priority]}`}>
            {card.priority}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-7 rounded-full px-2 text-xs" onClick={() => onEdit(card)}>
          Edit
        </Button>

        {availableMoveTargets.length > 0 && (
          <Select onValueChange={handleMoveCard}>
            <SelectTrigger className="h-7 w-[150px] rounded-full text-xs">
              <SelectValue placeholder="Move to..." />
            </SelectTrigger>
            <SelectContent>
              {availableMoveTargets.map((target) => (
                <SelectItem key={target.id} value={target.id}>
                  {target.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Dialog
        open={confirmMoveOpen}
        onOpenChange={(open) => {
          setConfirmMoveOpen(open);
          if (!open) setPendingMoveTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader className="pr-8">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <LuArrowRight className="h-5 w-5" />
              </div>
              <DialogTitle>Confirm Move</DialogTitle>
            </div>
            <DialogDescription>
              Move "{card.title}" to "{pendingMoveTarget?.title}"? This is usually a final status list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-1">
            <Button variant="secondary" className="h-10 rounded-md px-5" onClick={() => setConfirmMoveOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              className="h-10 rounded-md px-5"
              disabled={isProcessing}
              onClick={async () => {
                if (!pendingMoveTarget) return;
                setIsProcessing(true);
                try {
                  await Promise.resolve(onMoveCard(card.id, list.id, pendingMoveTarget.id));
                  setConfirmMoveOpen(false);
                } finally {
                  setIsProcessing(false);
                }
              }}
            >
              {isProcessing ? "Moving..." : "Move"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader className="pr-8">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <LuTrash2 className="h-5 w-5" />
              </div>
              <DialogTitle>Delete Card</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete "{card.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-1">
            <Button variant="secondary" className="h-10 rounded-md px-5" onClick={() => setDeleteOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="h-10 rounded-md px-5 text-white hover:text-white"
              disabled={isProcessing}
              onClick={async () => {
                setIsProcessing(true);
                try {
                  await Promise.resolve(onDeleteCard(list.id, card.id));
                  setDeleteOpen(false);
                } finally {
                  setIsProcessing(false);
                }
              }}
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function KanbanListColumn({
  list,
  allLists,
  totalCardCount,
  collapsed,
  onToggleCollapse,
  canMoveLeft,
  canMoveRight,
  onRenameList,
  onDeleteList,
  onMoveList,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onMoveCard,
}: {
  list: KanbanList;
  allLists: KanbanList[];
  totalCardCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onRenameList: (listId: string, title: string) => void | Promise<void>;
  onDeleteList: (listId: string) => void | Promise<void>;
  onMoveList: (listId: string, direction: "left" | "right") => void | Promise<void>;
  onAddCard: (listId: string, data: NewKanbanCard) => void | Promise<void>;
  onUpdateCard: (listId: string, cardId: string, data: Partial<NewKanbanCard>) => void | Promise<void>;
  onDeleteCard: (listId: string, cardId: string) => void | Promise<void>;
  onMoveCard: (cardId: string, fromListId: string, toListId: string) => void | Promise<void>;
}) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    attributes,
    listeners,
  } = useSortable({
    id: `list-${list.id}`,
    data: { type: "list", listId: list.id },
  });

  const { setNodeRef: setDropzoneRef, isOver } = useDroppable({
    id: `dropzone-${list.id}`,
    data: { type: "dropzone", listId: list.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(list.title);

  const [createOpen, setCreateOpen] = useState(false);
  const [editCard, setEditCard] = useState<KanbanCard | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeletingList, setIsDeletingList] = useState(false);

  const availableMoveTargets = useMemo(
    () => allLists.filter((l) => l.id !== list.id),
    [allLists, list.id]
  );

  const cardItems = useMemo(
    () => list.cards.map((card) => `card-${card.id}`),
    [list.cards]
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`vibe-card flex w-[320px] shrink-0 flex-col rounded-[1.5rem] bg-card p-4 ${
        collapsed ? "h-fit min-h-[120px]" : "h-fit min-h-[380px]"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editingTitle ? (
            <Input
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={() => {
                onRenameList(list.id, titleValue);
                setEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRenameList(list.id, titleValue);
                  setEditingTitle(false);
                }
                if (e.key === "Escape") {
                  setTitleValue(list.title);
                  setEditingTitle(false);
                }
              }}
              className="h-9 rounded-full"
            />
          ) : (
            <h3 className="truncate text-sm font-bold uppercase tracking-wide text-foreground">{list.title}</h3>
          )}
          <p className="text-xs text-muted-foreground">
            {list.cards.length}
            {list.cards.length !== totalCardCount ? ` / ${totalCardCount}` : ""} card
            {totalCardCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleCollapse}>
            {collapsed ? <LuChevronDown className="h-4 w-4" /> : <LuChevronUp className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
            <LuGripVertical className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTitle((v) => !v)}>
            <LuPencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteOpen(true)}>
            <LuTrash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {!collapsed && <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!canMoveLeft}
            onClick={() => onMoveList(list.id, "left")}
          >
            <LuArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!canMoveRight}
            onClick={() => onMoveList(list.id, "right")}
          >
            <LuArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <Button size="sm" className="h-8 rounded-full" onClick={() => setCreateOpen(true)}>
          <LuPlus className="mr-1 h-3.5 w-3.5" /> Add
        </Button>
      </div>}

      {!collapsed && <SortableContext items={cardItems} strategy={verticalListSortingStrategy}>
      <div
        ref={setDropzoneRef}
        className={`flex max-h-[460px] flex-col gap-2 overflow-y-auto rounded-lg pr-1 transition-colors ${
          isOver ? "bg-primary/5" : ""
        }`}
      >
        {list.cards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
            No tasks yet
          </div>
        ) : (
          list.cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              list={list}
              availableMoveTargets={availableMoveTargets}
              onDeleteCard={onDeleteCard}
              onMoveCard={onMoveCard}
              onEdit={setEditCard}
            />
          ))
        )}
      </div>
      </SortableContext>}

      <KanbanCardDialog
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={(data) => onAddCard(list.id, data)}
      />

      <KanbanCardDialog
        open={!!editCard}
        mode="edit"
        card={editCard ?? undefined}
        onClose={() => setEditCard(null)}
        onSubmit={(data) => {
          if (!editCard) return;
          onUpdateCard(list.id, editCard.id, data);
        }}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader className="pr-8">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <LuTrash2 className="h-5 w-5" />
              </div>
              <DialogTitle>Delete List</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete "{list.title}"? All cards in this list will be removed and this action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-1">
            <Button variant="secondary" className="h-10 rounded-md px-5" onClick={() => setDeleteOpen(false)} disabled={isDeletingList}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="h-10 rounded-md px-5 text-white hover:text-white"
              disabled={isDeletingList}
              onClick={async () => {
                setIsDeletingList(true);
                try {
                  await Promise.resolve(onDeleteList(list.id));
                  setDeleteOpen(false);
                } finally {
                  setIsDeletingList(false);
                }
              }}
            >
              {isDeletingList ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
