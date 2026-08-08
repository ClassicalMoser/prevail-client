import type { SeatSelection } from '@application/play/selection/core/types';

export function undoMoveUnit(
  selection: Extract<SeatSelection, { kind: 'moveUnit' }>,
): SeatSelection {
  if (selection.pendingDestination !== undefined) {
    return {
      ...selection,
      pendingDestination: undefined,
    };
  }
  return {
    kind: 'moveUnit',
    unit: undefined,
    destinations: [],
    pendingDestination: undefined,
  };
}
