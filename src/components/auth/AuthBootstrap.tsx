import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return <>{children}</>;
}
