import { useState } from "react";
import { LuChevronLeft, LuChevronRight, LuPencil, LuTrash } from "react-icons/lu";
import { usePagination } from "@/hooks/usePagination";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import FormModal from "./FormModal";
import DeleteModal from "./DeleteModal";
import { notifyMutationResult } from "@/lib/form-feedback";

type Data = {
    id: string;
    subject: string;
    topic: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    date: string;
    notes: string;
};

interface ListTableProps {
    headers: { title: string; textAlign?: "start" | "center" | "end" }[];
    data: Data[];
}

export const ListTable = ({ headers, data }: ListTableProps) => {
    const { page, totalItems, paginatedData, prev, next, goto } = usePagination<Data>(data, 5);
    const { remove } = useHistoryStore();
    const totalPages = Math.max(1, Math.ceil(totalItems / 5));

    const [editTarget, setEditTarget] = useState<{ open: boolean; item: Data | null }>({
        open: false,
        item: null,
    });
    const [deleteTarget, setDeleteTarget] = useState<{ open: boolean; item: Data | null }>({
        open: false,
        item: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {headers.map((h) => (
                            <TableHead key={h.title} className={cn(h.textAlign === "center" ? "text-center" : "")}>
                                {h.title}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="text-sm font-medium text-foreground">{item.subject}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.topic}</TableCell>
                            <TableCell className="text-sm text-foreground/90">{item.startTime} - {item.endTime}</TableCell>
                            <TableCell>
                                <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500 dark:text-emerald-400">
                                    {item.durationMinutes} min
                                </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.date}</TableCell>
                            <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">{item.notes || "-"}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-full"
                                        onClick={() => setEditTarget({ open: true, item })}
                                    >
                                        <LuPencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-full border-red-500/25 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                        onClick={() => setDeleteTarget({ open: true, item })}
                                    >
                                        <LuTrash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={prev}>
                    <LuChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex bg-muted/30 rounded-full p-1 gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <Button
                            key={i + 1}
                            variant={page === i + 1 ? "default" : "ghost"}
                            size="icon"
                            className={cn("h-8 w-8 rounded-full", page === i + 1 && "shadow-sm")}
                            onClick={() => goto(i + 1)}
                        >
                            {i + 1}
                        </Button>
                    ))}
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={next}>
                    <LuChevronRight className="h-5 w-5" />
                </Button>
            </div>

            <FormModal
                open={editTarget.open}
                item={editTarget.item}
                onClose={() => setEditTarget({ open: false, item: null })}
            />
            <DeleteModal
                open={deleteTarget.open}
                item={deleteTarget.item}
                isProcessing={isDeleting}
                onClose={() => setDeleteTarget({ open: false, item: null })}
                onConfirm={async () => {
                    if (!deleteTarget.item) return;

                    setIsDeleting(true);
                    try {
                        const result = await remove(deleteTarget.item.id);
                        const success = notifyMutationResult(result, {
                            success: "Study session deleted.",
                            successOffline: "Session removed locally. It will sync once online.",
                            error: "Failed to delete study session.",
                        });

                        if (success) {
                            setDeleteTarget({ open: false, item: null });
                        }
                    } finally {
                        setIsDeleting(false);
                    }
                }}
            />
        </>
    );
};
