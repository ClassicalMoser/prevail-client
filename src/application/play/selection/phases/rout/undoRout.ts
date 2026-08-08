import type { SeatSelection } from '@application/play/selection/core/types';

export function undoRout(): SeatSelection {
  return { kind: 'routDiscard', selectedCardIds: [] };
}
