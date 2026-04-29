import { NavLink } from "react-router-dom";
import { LuChevronRight } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { studyNavGroups, studySecondaryNavItems } from "./study-nav";
import { useAuthStore } from "@/stores/useAuthStore";

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const user = useAuthStore((state) => state.user);

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

  return (
    <aside className={cn("hidden shrink-0 md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex transition-[width] duration-300", isCollapsed ? "md:w-24" : "md:w-72")}>
      <div className={cn("vibe-glass flex h-screen w-full flex-col rounded-none border-y-0 border-l-0 border-black/5 dark:border-white/10", isCollapsed ? "p-3" : "p-4")}>
        <div className={cn("mb-6 flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
          <span className={cn("inline-flex items-center gap-2 text-base font-bold tracking-tight text-foreground", isCollapsed ? "justify-center" : "text-lg")}>
            <span className="vibe-brand-dot inline-block h-2.5 w-2.5 rounded-full" />
            <span className={cn(isCollapsed && "hidden")}>Pebble</span>
          </span>
        </div>

  <nav className={cn("flex-1 overflow-y-auto pr-1", isCollapsed ? "space-y-3" : "space-y-5")}>
          {studyNavGroups.map((group, index) => (
            <div key={group.title}>
              <div className="space-y-1.5">
                <p className={cn("px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80", isCollapsed && "hidden")}>
                  {group.title}
                </p>

                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.label}
                      to={item.route}
                      end={item.end}
                      title={item.label}
                      className={({ isActive }) =>
                        cn(
                          "group flex h-10 items-center rounded-xl text-sm font-medium transition-all duration-200",
                          isCollapsed ? "justify-center px-2" : "h-11 justify-start gap-3 px-3",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        )
                      }
                    >
                      <Icon className="h-4.5 w-4.5 shrink-0" />
                      <span className={cn(isCollapsed && "hidden")}>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              {isCollapsed && index < studyNavGroups.length - 1 ? <div className="mx-1 mt-2 h-px bg-black/10 dark:bg-white/12" /> : null}
            </div>
          ))}
        </nav>

        <div className="mt-3 pt-1">
          {isCollapsed ? <div className="mx-1 h-px bg-black/10 dark:bg-white/12" /> : null}

          <div className="mt-2.5 space-y-3">
          {studySecondaryNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.route}
                end={item.end}
                title={item.label}
                className={({ isActive }) =>
                  cn(
                    "group flex h-10 items-center rounded-xl text-sm font-medium transition-all duration-200",
                    isCollapsed ? "justify-center px-2" : "h-11 justify-start gap-3 px-3",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className={cn(isCollapsed && "hidden")}>{item.label}</span>
              </NavLink>
            );
          })}

            {isCollapsed ? (
              <NavLink
                to="/study-tracker/profile"
                title="Profile"
                className={({ isActive }) =>
                  cn(
                    "flex h-10 items-center justify-center rounded-xl transition-colors",
                    isActive ? "bg-primary/15" : "hover:bg-muted/60"
                  )
                }
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-400 text-[11px] font-bold text-primary-foreground">
                  {initials}
                </div>
              </NavLink>
            ) : (
              <NavLink
                to="/study-tracker/profile"
                className="flex items-center gap-3 rounded-xl border border-black/8 bg-muted/25 px-3 py-2.5 transition-colors hover:bg-muted/50 dark:border-white/10"
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
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
