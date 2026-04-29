import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Invalid email or password."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/study-tracker";

  const login = useAuthStore((state) => state.login);
  const runAuthTransition = useAuthStore((state) => state.runAuthTransition);
  const clearError = useAuthStore((state) => state.clearError);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const [isSubmitRedirecting, setIsSubmitRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated && !isSubmitRedirecting) {
      navigate("/study-tracker", { replace: true });
    }
  }, [isAuthenticated, isBootstrapping, isSubmitRedirecting, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitRedirecting(true);
    const success = await login(values);

    if (!success) {
      setIsSubmitRedirecting(false);
      return;
    }

    if (success) {
      toast.success("Welcome back 👋");
      await runAuthTransition("login", async () => {
        navigate(redirect, { replace: true });
      });
    }
  });

  return (
    <AuthShell title="Login" subtitle="Access your study workspace.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 rounded-full"
            {...register("email")}
          />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11 rounded-full"
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        {error ? <p className="text-xs text-destructive">{error.message}</p> : null}

        <Button type="submit" className="h-11 w-full rounded-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Login"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to={`/auth/register?redirect=${encodeURIComponent(redirect)}`}
            className="font-semibold text-foreground underline underline-offset-4"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
