import { ReactNode, useEffect, useState } from "react";
import { Header } from "@/components/custom/Header";
import { Sidebar } from "@/components/custom/Sidebar";
import { motion, AnimatePresence } from "motion/react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

const SIDEBAR_COLLAPSED_KEY = "study-tracker.sidebar-collapsed";
const TABLET_MEDIA_QUERY = "(min-width: 768px) and (max-width: 1023.98px)";

export function AppLayout({ children }: { children: ReactNode }) {
    const location = useLocation();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
    const [userSidebarCollapsed, setUserSidebarCollapsed] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    });
    const [isTabletViewport, setIsTabletViewport] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(TABLET_MEDIA_QUERY).matches;
    });

    useEffect(() => {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(userSidebarCollapsed));
    }, [userSidebarCollapsed]);

    useEffect(() => {
        const mediaQuery = window.matchMedia(TABLET_MEDIA_QUERY);
        const update = () => setIsTabletViewport(mediaQuery.matches);

        update();
        mediaQuery.addEventListener("change", update);

        return () => mediaQuery.removeEventListener("change", update);
    }, []);

    const isSidebarCollapsed = isTabletViewport || userSidebarCollapsed;

    const sidebarOffsetClass = isSidebarCollapsed ? "md:pl-24" : "md:pl-72";

    if (isBootstrapping) {
        return (
            <div className="grid min-h-screen place-items-center bg-background text-foreground">
                <div className="vibe-card rounded-2xl bg-card px-5 py-3 text-sm font-medium text-muted-foreground">
                    Preparing your workspace...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        const redirectTo = `${location.pathname}${location.search}`;
        return <Navigate to={`/auth/login?redirect=${encodeURIComponent(redirectTo)}`} replace />;
    }

    return (
        <div className="vibe-page-bg min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className={`flex min-h-screen w-full transition-[padding] duration-300 ${sidebarOffsetClass}`}>
                <Sidebar isCollapsed={isSidebarCollapsed} />

                <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                    <Header
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setUserSidebarCollapsed((prev) => !prev)}
                    />

                    <AnimatePresence mode="wait">
                        <motion.main
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 p-3 pb-6 md:p-4 md:pb-8 lg:p-6"
                        >
                            {children}
                        </motion.main>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
