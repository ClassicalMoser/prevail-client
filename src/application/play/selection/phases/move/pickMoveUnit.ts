import type {
  Coordinate,
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';
import { legalDestinationsForUnit } from './legalDestinationsForUnit';

type MoveSelection = Extract<SeatSelection, { kind: 'moveUnit' }>;

export function pickMoveUnit(args: {
  coordinate: Coordinate;
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }>;
  moveSelection: MoveSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, options, moveSelection, state } = args;
  const unit = options.moveUnits.units.find(
    (u) => u.placement.coordinate === coordinate,
  );
  if (unit === undefined) {
    return { selection: moveSelection };
  }
  return {
    selection: {
      kind: 'moveUnit',
      unit,
      destinations: legalDestinationsForUnit(unit, state),
      pendingDestination: undefined,
    },
  };
}
