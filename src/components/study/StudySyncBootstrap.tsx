import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { syncStudyOutbox } from '@/features/study/offlineSync';

export function StudySyncBootstrap() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const sync = () => {
      void syncStudyOutbox(queryClient);
    };

    sync();
    window.addEventListener('online', sync);

    return () => {
      window.removeEventListener('online', sync);
    };
  }, [queryClient]);

  return null;
}
