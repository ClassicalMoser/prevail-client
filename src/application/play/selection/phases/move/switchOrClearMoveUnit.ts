import type {
  Coordinate,
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { unitKey } from '@application/play/selection/core';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';
import { legalDestinationsForUnit } from './legalDestinationsForUnit';

type MoveSelection = Extract<SeatSelection, { kind: 'moveUnit' }>;

/** Clear or switch unit when clicking a unit hex; undefined if not a unit click. */
export function switchOrClearMoveUnit(args: {
  coordinate: Coordinate;
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }>;
  moveSelection: MoveSelection;
  state: GameState;
}): CellClickResult | undefined {
  const { coordinate, options, moveSelection, state } = args;
  if (moveSelection.unit === undefined) {
    return undefined;
  }
  const otherUnit = options.moveUnits.units.find(
    (u) => u.placement.coordinate === coordinate,
  );
  if (otherUnit === undefined) {
    return undefined;
  }
  if (unitKey(otherUnit.unit) === unitKey(moveSelection.unit.unit)) {
    return {
      selection: {
        kind: 'moveUnit',
        unit: undefined,
        destinations: [],
        pendingDestination: undefined,
      },
    };
  }
  return {
    selection: {
      kind: 'moveUnit',
      unit: otherUnit,
      destinations: legalDestinationsForUnit(otherUnit, state),
      pendingDestination: undefined,
    },
  };
}
