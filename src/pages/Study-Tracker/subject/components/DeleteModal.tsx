import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { LuTrash2 } from "react-icons/lu";

export default function DeleteModal({
    open,
    item,
    isProcessing = false,
    onClose,
    onConfirm,
}: {
    open: boolean;
    item: { id: string; subject: string } | null;
    isProcessing?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent>
                <DialogHeader className="pr-8">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                            <LuTrash2 className="h-5 w-5" />
                        </div>
                        <DialogTitle>Delete Subject</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to delete "{item?.subject ?? ""}"? This action
                        cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-1">
                    <Button variant="secondary" className="h-10 rounded-md px-5" onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button variant="destructive" className="h-10 rounded-md px-5 text-white hover:text-white" onClick={onConfirm} disabled={isProcessing}>
                        {isProcessing ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}