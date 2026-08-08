import type { SeatSelection } from '@application/play/selection/core/types';

export function initialMoveUnitSelection(): SeatSelection {
  return {
    kind: 'moveUnit',
    unit: undefined,
    destinations: [],
    pendingDestination: undefined,
  };
}
