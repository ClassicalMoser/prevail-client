import type { SeatSelection } from '@application/play/selection/core/types';

export function initialRoutSelection(): SeatSelection {
  return { kind: 'routDiscard', selectedCardIds: [] };
}
