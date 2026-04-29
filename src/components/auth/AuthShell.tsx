import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="vibe-page-bg min-h-screen bg-background px-4 py-8 text-foreground sm:py-10">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 self-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="vibe-brand-dot inline-block h-2.5 w-2.5 rounded-full" />
          Pebble Study Tracker
        </Link>

        <div className="vibe-card rounded-[2rem] bg-card p-6 sm:p-7">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
