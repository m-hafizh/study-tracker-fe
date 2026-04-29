import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function LeaveStudySessionGuard({ when }: { when: boolean }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [pendingPath, setPendingPath] = useState<string | null>(null);
    const currentPathRef = useRef("");

    useEffect(() => {
        currentPathRef.current = `${location.pathname}${location.search}${location.hash}`;
    }, [location.pathname, location.search, location.hash]);

    useEffect(() => {
        if (!when) {
            setOpen(false);
            setPendingPath(null);
            return;
        }

        const handleDocumentClick = (event: MouseEvent) => {
            if (event.defaultPrevented) return;
            if (event.button !== 0) return;
            if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

            const target = event.target as Element | null;
            const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

            if (!anchor) return;
            if (anchor.target && anchor.target !== "_self") return;
            if (anchor.hasAttribute("download")) return;

            const url = new URL(anchor.href, window.location.href);
            if (url.origin !== window.location.origin) return;

            const nextPath = `${url.pathname}${url.search}${url.hash}`;
            const currentPath = currentPathRef.current;
            if (nextPath === currentPath) return;

            event.preventDefault();
            setPendingPath(nextPath);
            setOpen(true);
        };

        const handlePopState = () => {
            const nextPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
            const currentPath = currentPathRef.current;

            if (nextPath === currentPath) return;

            window.history.pushState(null, "", currentPath);
            setPendingPath(nextPath);
            setOpen(true);
        };

        document.addEventListener("click", handleDocumentClick, true);
        window.addEventListener("popstate", handlePopState);

        return () => {
            document.removeEventListener("click", handleDocumentClick, true);
            window.removeEventListener("popstate", handlePopState);
        };
    }, [when]);

    useEffect(() => {
        if (!when) return;

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [when]);

    const handleStay = () => {
        setOpen(false);
        setPendingPath(null);
    };

    const handleLeave = () => {
        if (pendingPath) {
            navigate(pendingPath);
        }
        setOpen(false);
        setPendingPath(null);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    handleStay();
                    return;
                }
                setOpen(nextOpen);
            }}
        >
            <DialogContent>
                <DialogHeader className="pr-8">
                    <DialogTitle>Leave active study session?</DialogTitle>
                    <DialogDescription>
                        Your timer is still running. If you leave this page, your session can be interrupted.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-1">
                    <Button variant="secondary" className="h-10 rounded-md px-5" onClick={handleStay}>
                        Stay here
                    </Button>
                    <Button variant="destructive" className="h-10 rounded-md px-5" onClick={handleLeave}>
                        Leave page
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
