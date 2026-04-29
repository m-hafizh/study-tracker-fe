import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmNewPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match.",
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from current password.",
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const changePassword = useAuthStore((state) => state.changePassword);
  const clearError = useAuthStore((state) => state.clearError);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    const success = await changePassword({ currentPassword, newPassword });
    if (success) {
      toast.success("Password updated successfully.");
      reset();
      return;
    }

    toast.error(useAuthStore.getState().error?.message ?? "Failed to update password.");
  });

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-2xl space-y-4 pb-4">
        <div className="vibe-card rounded-[1.5rem] bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Change Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This is currently local-only storage and follows the backend-ready auth contract.
          </p>
        </div>

        <div className="vibe-card rounded-[1.5rem] bg-card p-5 sm:p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                className="h-11 rounded-full"
                disabled={isLoading}
                {...register("currentPassword")}
              />
              {errors.currentPassword ? (
                <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                className="h-11 rounded-full"
                disabled={isLoading}
                {...register("newPassword")}
              />
              {errors.newPassword ? (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm new password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                autoComplete="new-password"
                className="h-11 rounded-full"
                disabled={isLoading}
                {...register("confirmNewPassword")}
              />
              {errors.confirmNewPassword ? (
                <p className="text-xs text-destructive">{errors.confirmNewPassword.message}</p>
              ) : null}
            </div>

            {error ? <p className="text-xs text-destructive">{error.message}</p> : null}

            <Button type="submit" className="h-11 rounded-full" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
