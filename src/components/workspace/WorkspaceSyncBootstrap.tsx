import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { syncWorkspaceOutbox } from '@/features/workspace/offlineSync';

export function WorkspaceSyncBootstrap() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const sync = () => {
      void syncWorkspaceOutbox(queryClient);
    };

    sync();
    window.addEventListener('online', sync);

    return () => {
      window.removeEventListener('online', sync);
    };
  }, [queryClient]);

  return null;
}
