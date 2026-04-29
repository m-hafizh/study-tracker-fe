import { Link } from "react-router-dom";
import { LuBell, LuLock, LuPalette, LuShieldCheck } from "react-icons/lu";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

const settingsCards = [
  {
    title: "Appearance",
    description: "Adjust theme and visual preferences for your workspace.",
    icon: LuPalette,
  },
  {
    title: "Notifications",
    description: "Control reminders for study plans and sessions.",
    icon: LuBell,
  },
  {
    title: "Privacy",
    description: "Manage local data and account privacy options.",
    icon: LuShieldCheck,
  },
];

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-5xl space-y-4 pb-4">
        <div className="vibe-card rounded-[1.5rem] bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage your study workspace preferences.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {settingsCards.map(({ title, description, icon: Icon }) => (
            <div key={title} className="vibe-card rounded-[1.25rem] bg-card p-4">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted/35 text-muted-foreground">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>

        <div className="vibe-card rounded-[1.25rem] bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted/35 text-muted-foreground">
                <LuLock className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Security</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Manage account credentials and keep your login secure.
              </p>
            </div>

            <Button asChild variant="outline" className="h-10 rounded-full px-4">
              <Link to="/study-tracker/change-password">Change Password</Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
