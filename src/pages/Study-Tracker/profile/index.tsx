import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuLogOut, LuMail, LuShield, LuUserRound } from "react-icons/lu";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Please enter a valid email."),
  avatarUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^https?:\/\//i.test(value), {
      message: "Avatar URL should start with http:// or https://",
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const runAuthTransition = useAuthStore((state) => state.runAuthTransition);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const clearError = useAuthStore((state) => state.clearError);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

  const handleLogoutConfirmed = async () => {
    setIsLogoutConfirmOpen(false);

    await runAuthTransition("logout", async () => {
      await logout();
      navigate("/auth/login", { replace: true });
    });

    toast.success("Logged out successfully.");
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || "",
    });
  }, [reset, user]);

  const onEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);

    if (!open && user) {
      clearError();
      reset({
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || "",
      });
    }
  };

  const onSubmitProfile = handleSubmit(async (values) => {
    if (!isDirty) {
      toast.info("No changes to save.");
      return;
    }

    const success = await updateProfile({
      name: values.name,
      email: values.email,
      avatarUrl: values.avatarUrl || undefined,
    });

    if (success) {
      toast.success("Profile updated successfully.");
      setIsEditOpen(false);
      return;
    }

    const fallback = "Failed to update profile.";
    toast.error(useAuthStore.getState().error?.message ?? fallback);
  });

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-4xl space-y-4 pb-4">
        <div className="vibe-card rounded-[1.5rem] bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-400 text-sm font-bold text-primary-foreground">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{user?.name || "Study User"}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || "study@example.com"}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="h-9 rounded-full px-4"
              onClick={() => onEditOpenChange(true)}
              disabled={isLoading}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="vibe-card rounded-[1.25rem] bg-card p-4">
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted/35 text-muted-foreground">
              <LuUserRound className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">Display name</p>
            <p className="text-sm font-medium text-foreground">{user?.name || "Study User"}</p>
          </div>

          <div className="vibe-card rounded-[1.25rem] bg-card p-4">
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted/35 text-muted-foreground">
              <LuMail className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="truncate text-sm font-medium text-foreground">{user?.email || "study@example.com"}</p>
          </div>

          <div className="vibe-card rounded-[1.25rem] bg-card p-4">
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted/35 text-muted-foreground">
              <LuShield className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="text-sm font-medium text-foreground">Member</p>
          </div>
        </div>

        <div className="vibe-card rounded-[1.25rem] bg-card p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground">Account actions</h3>
          <p className="mt-1 text-xs text-muted-foreground">Session and security controls for your account.</p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="outline" className="h-10 rounded-full px-4">
              <Link to="/study-tracker/settings">Security settings</Link>
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="h-10 rounded-full px-4"
              onClick={() => setIsLogoutConfirmOpen(true)}
            >
              <LuLogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You&apos;ll need to sign in again to access your workspace.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={() => setIsLogoutConfirmOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
              onClick={handleLogoutConfirmed}
              disabled={isLoading}
            >
              {isLoading ? "Logging out..." : "Yes, logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your account information. This currently uses local storage and is ready for backend swap.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={onSubmitProfile}>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                type="text"
                placeholder="Your name"
                className="h-11 rounded-full"
                {...register("name")}
              />
              {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
              {error?.fieldErrors?.name ? <p className="text-xs text-destructive">{error.fieldErrors.name}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-full"
                {...register("email")}
              />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
              {error?.fieldErrors?.email ? <p className="text-xs text-destructive">{error.fieldErrors.email}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-avatar-url">Avatar URL (optional)</Label>
              <Input
                id="edit-avatar-url"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                className="h-11 rounded-full"
                {...register("avatarUrl")}
              />
              {errors.avatarUrl ? <p className="text-xs text-destructive">{errors.avatarUrl.message}</p> : null}
            </div>

            {error && !error.fieldErrors ? (
              <p className="text-xs text-destructive">{error.message}</p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => onEditOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={isLoading || !isDirty}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
