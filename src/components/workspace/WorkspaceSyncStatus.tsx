import { useEffect, useMemo, useState } from 'react';
import { LuCloudOff, LuCloud, LuRefreshCw, LuCheck } from 'react-icons/lu';

import { Badge } from '@/components/ui/badge';
import {
  getWorkspaceSyncState,
  subscribeWorkspaceSyncState,
  type WorkspaceSyncState,
} from '@/features/workspace/offlineSync';
import { cn } from '@/lib/utils';

const getStatusView = (state: WorkspaceSyncState) => {
  if (!state.online) {
    return {
      label: `Offline${state.pendingCount > 0 ? ` · ${state.pendingCount} pending` : ''}`,
      detail: state.pendingCount > 0 ? 'Changes are queued and will sync when online.' : 'You are offline.',
      className: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      icon: LuCloudOff,
      spinning: false,
    };
  }

  if (state.syncing) {
    return {
      label: 'Syncing…',
      detail: 'Sync in progress.',
      className: 'border-primary/30 bg-primary/10 text-primary',
      icon: LuRefreshCw,
      spinning: true,
    };
  }

  if (state.pendingCount > 0) {
    return {
      label: `${state.pendingCount} pending`,
      detail: 'Changes are pending and will retry automatically.',
      className: 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300',
      icon: LuCloud,
      spinning: false,
    };
  }

  return {
    label: 'Synced',
    detail: 'All changes are synced.',
    className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    icon: LuCheck,
    spinning: false,
  };
};

export function WorkspaceSyncStatus() {
  const [state, setState] = useState<WorkspaceSyncState>(() => getWorkspaceSyncState());

  useEffect(() => subscribeWorkspaceSyncState(setState), []);

  const view = useMemo(() => getStatusView(state), [state]);
  const Icon = view.icon;

  return (
    <Badge
      variant="outline"
      title={view.detail}
      className={cn('hidden h-8 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold md:inline-flex', view.className)}
    >
      <Icon className={cn('h-3.5 w-3.5', view.spinning && 'animate-spin')} />
      <span>{view.label}</span>
    </Badge>
  );
}
