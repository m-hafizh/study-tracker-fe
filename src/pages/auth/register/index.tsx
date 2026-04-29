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

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/study-tracker";

  const registerUser = useAuthStore((state) => state.register);
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
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
    const success = await registerUser({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (!success) {
      setIsSubmitRedirecting(false);
      return;
    }

    if (success) {
      toast.success("Account created successfully 🎉");
      await runAuthTransition("register", async () => {
        navigate(redirect, { replace: true });
      });
    }
  });

  return (
    <AuthShell title="Create account" subtitle="Start tracking your study progress.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" type="text" placeholder="Your name" className="h-11 rounded-full" {...register("name")} />
          {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
        </div>

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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="h-11 rounded-full"
            {...register("password")}
          />
          {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            className="h-11 rounded-full"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        {error ? <p className="text-xs text-destructive">{error.message}</p> : null}

        <Button type="submit" className="h-11 w-full rounded-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Register"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to={`/auth/login?redirect=${encodeURIComponent(redirect)}`}
            className="font-semibold text-foreground underline underline-offset-4"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
