import type { SeatSelection } from './types';

export function emptySelection(): SeatSelection {
  return { kind: 'idle' };
}
