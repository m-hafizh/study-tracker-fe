import { useState, useCallback } from "react";

type DialogOptions = {
    title?: string;
    description?: string;
    content?: React.ReactNode; // dont assign input element because it doesn't work well
}

export function useDialog() {
    const [open, setOpen] = useState<boolean>(false);
    const [options, setOptions] = useState<DialogOptions | null>(null);

    const openDialog = useCallback((opts: DialogOptions) => {
        if (opts) setOptions(opts);
        setOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        setOpen(false);
    }, []);

    return {
        open,
        options,
        openDialog,
        closeDialog,
        setOpen,
    }
}