import type { Coordinate } from '@classicalmoser/prevail-rules/domain';
import { placementForCoordinate } from '@application/play/selection/core';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';

type MoveSelection = Extract<SeatSelection, { kind: 'moveUnit' }>;

export function stageMoveDestination(
  moveSelection: MoveSelection,
  coordinate: Coordinate,
): CellClickResult {
  if (
    placementForCoordinate(moveSelection.destinations, coordinate) === undefined
  ) {
    return { selection: moveSelection };
  }
  if (moveSelection.pendingDestination === coordinate) {
    return {
      selection: {
        ...moveSelection,
        pendingDestination: undefined,
      },
    };
  }
  return {
    selection: {
      ...moveSelection,
      pendingDestination: coordinate,
    },
  };
}
