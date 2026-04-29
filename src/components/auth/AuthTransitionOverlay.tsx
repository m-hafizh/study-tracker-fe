import { LuRefreshCw } from 'react-icons/lu';

import { useAuthStore, type AuthTransitionMode } from '@/stores/useAuthStore';

const COPY_BY_MODE: Record<Exclude<AuthTransitionMode, null>, { title: string; subtitle: string }> = {
  login: {
    title: 'Signing you in...',
    subtitle: 'Preparing your dashboard.',
  },
  register: {
    title: 'Creating your workspace...',
    subtitle: 'Setting up everything for your first session.',
  },
  logout: {
    title: 'Signing you out...',
    subtitle: 'Securing your session.',
  },
};

export function AuthTransitionOverlay() {
  const isAuthTransitioning = useAuthStore((state) => state.isAuthTransitioning);
  const authTransitionMode = useAuthStore((state) => state.authTransitionMode);

  if (!isAuthTransitioning || !authTransitionMode) {
    return null;
  }

  const copy = COPY_BY_MODE[authTransitionMode];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/75 backdrop-blur-sm">
      <div className="vibe-card w-[min(92vw,26rem)] rounded-2xl border border-border/65 bg-card/95 p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <LuRefreshCw className="h-5 w-5 animate-spin" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{copy.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>
    </div>
  );
}
