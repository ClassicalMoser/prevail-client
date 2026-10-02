import type { GameSeatConnectionStatus } from '@ports';

const STATUS_LABELS: Record<GameSeatConnectionStatus, string> = {
  connecting: 'Connecting',
  open: 'Connected',
  closed: 'Disconnected',
  error: 'Connection error',
};

/** Player-facing seat stream status. Never show the raw status key. */
function connectionStatusLabel(status: GameSeatConnectionStatus): string {
  const label = STATUS_LABELS[status];
  return label;
}

export { connectionStatusLabel };
