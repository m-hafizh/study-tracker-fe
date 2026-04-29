import { useState } from "react";
import { LuChevronLeft, LuChevronRight, LuPencil, LuPlus, LuTrash } from "react-icons/lu";
import { usePagination } from "@/hooks/usePagination";
import { useSubjectStore } from "@/stores/useSubjectStore";
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
    color: string;
};

interface ListTableProps {
    headers: { title: string; textAlign?: "start" | "center" | "end" }[];
    data: Data[];
    searchSlot?: React.ReactNode;
}

export const ListTable = ({ headers, data, searchSlot }: ListTableProps) => {
    const { page, totalItems, paginatedData, prev, next, goto } = usePagination<Data>(data, 5);
    const { remove } = useSubjectStore();
    const totalPages = Math.max(1, Math.ceil(totalItems / 5));

    const [openFormModal, setOpenFormModal] = useState<{
        type: "Add" | "Edit" | null;
        isOpen: boolean;
        item?: Data | null;
    }>({ type: "Add", isOpen: false, item: null });
    const [deleteTarget, setDeleteTarget] = useState<{ open: boolean; item: Data | null }>({
        open: false,
        item: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    return (
        <>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {searchSlot || <div />}
                <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() =>
                        setOpenFormModal((prev) => ({
                            ...prev,
                            type: "Add",
                            isOpen: !prev.isOpen,
                        }))
                    }
                >
                    Create <LuPlus className="ml-1 h-4 w-4" />
                </Button>
            </div>

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
                            <TableCell>
                                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-2.5 py-1 text-xs font-medium dark:border-white/10 dark:bg-white/5">
                                    <div
                                        className="h-3.5 w-3.5 rounded-full border border-black/10 dark:border-white/20"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="uppercase tracking-wide text-muted-foreground">{item.color}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 rounded-full"
                                        onClick={() =>
                                            setOpenFormModal({
                                                type: "Edit",
                                                isOpen: true,
                                                item,
                                            })
                                        }
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

            <FormModal open={openFormModal} setOpen={setOpenFormModal} />
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
                            success: "Subject deleted.",
                            successOffline: "Subject removed locally. It will sync once online.",
                            error: "Failed to delete subject.",
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
