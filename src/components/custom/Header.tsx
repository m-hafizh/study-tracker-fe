import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LuMenu, LuSun, LuMoon, LuChevronRight, LuPanelLeftOpen, LuPanelLeftClose } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { WorkspaceSyncStatus } from "@/components/workspace/WorkspaceSyncStatus";
import { studyNavGroups, studyNavItems, studySecondaryNavItems } from "./study-nav";
import { useAuthStore } from "@/stores/useAuthStore";

function getCurrentSection(pathname: string) {
    const normalizedPath = pathname.replace(/\/+$/, "") || "/";

    const exactMatch = studyNavItems.find((item) => normalizedPath === item.route);
    if (exactMatch) return exactMatch.label;

    const prefixMatch = [...studyNavItems]
        .sort((a, b) => b.route.length - a.route.length)
        .find((item) => normalizedPath.startsWith(`${item.route}/`));

    return prefixMatch?.label ?? "Study Tracker";
}

export const Header = ({
    isSidebarCollapsed,
    onToggleSidebar,
}: {
    isSidebarCollapsed: boolean;
    onToggleSidebar: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const currentSection = getCurrentSection(location.pathname);
    const user = useAuthStore((state) => state.user);

    const initials =
        user?.name
            ?.split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "ST";

    return (
        <>
            <header className="sticky top-0 z-40 px-3 pt-3 md:px-0 md:pt-0">
                <div className="vibe-glass flex items-center justify-between rounded-2xl px-4 py-3 text-foreground md:rounded-none md:border-x-0 md:border-t-0 lg:px-5">
                    <div className="flex min-w-0 items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden rounded-full text-muted-foreground hover:bg-muted hover:text-foreground lg:inline-flex"
                            onClick={onToggleSidebar}
                            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isSidebarCollapsed ? <LuPanelLeftOpen className="h-4.5 w-4.5" /> : <LuPanelLeftClose className="h-4.5 w-4.5" />}
                        </Button>

                        <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground/80">Study Tracker</p>
                        <h1 className="truncate text-base font-semibold text-foreground lg:text-lg">{currentSection}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <WorkspaceSyncStatus />

                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-transform duration-300 hover:scale-[1.02] active:scale-95"
                            onClick={() => setTheme(theme === "dark" || (theme === "system" && document.documentElement.classList.contains("dark")) ? "light" : "dark")}
                        >
                            {theme === "dark" || (theme === "system" && document.documentElement.classList.contains("dark")) ? (
                                <LuSun className="h-5 w-5" />
                            ) : (
                                <LuMoon className="h-5 w-5" />
                            )}
                        </Button>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground md:hidden transition-transform duration-300 hover:scale-[1.02] active:scale-95"
                            onClick={() => setOpen(true)}
                        >
                            <LuMenu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Mobile Sheet */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" className="border-r border-border bg-background/98">
                    <SheetHeader>
                        <SheetTitle className="text-foreground">Navigation</SheetTitle>
                    </SheetHeader>
                    <nav className="mt-5 space-y-4">
                        {studyNavGroups.map((group) => (
                            <div key={group.title} className="space-y-1.5">
                                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
                                    {group.title}
                                </p>

                                {group.items.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <NavLink
                                            key={item.label}
                                            to={item.route}
                                            end={item.end}
                                            onClick={() => setOpen(false)}
                                            className={({ isActive }) =>
                                                cn(
                                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                                    isActive
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                )
                                            }
                                        >
                                            <Icon className="h-4.5 w-4.5" />
                                            {item.label}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        ))}

                        <div className="space-y-1.5 border-t border-border pt-3">
                            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
                                Account
                            </p>

                            {studySecondaryNavItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.label}
                                        to={item.route}
                                        end={item.end}
                                        onClick={() => setOpen(false)}
                                        className={({ isActive }) =>
                                            cn(
                                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            )
                                        }
                                    >
                                        <Icon className="h-4.5 w-4.5" />
                                        {item.label}
                                    </NavLink>
                                );
                            })}

                            <NavLink
                                to="/study-tracker/profile"
                                onClick={() => setOpen(false)}
                                className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-400 text-xs font-bold text-primary-foreground">
                                    {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-foreground">{user?.name || "Study User"}</p>
                                    <p className="truncate text-xs text-muted-foreground">{user?.email || "study@example.com"}</p>
                                </div>
                                <LuChevronRight className="h-4 w-4 text-muted-foreground" />
                            </NavLink>
                        </div>
                    </nav>
                </SheetContent>
            </Sheet>
        </>
    );
};
