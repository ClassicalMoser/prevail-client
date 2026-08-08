import type {
  Coordinate,
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';
import { pickMoveUnit } from './pickMoveUnit';
import { stageMoveDestination } from './stageMoveDestination';
import { switchOrClearMoveUnit } from './switchOrClearMoveUnit';

export function handleMoveUnitCellClick(args: {
  coordinate: Coordinate;
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }>;
  selection: SeatSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, options, selection, state } = args;
  const moveSelection: Extract<SeatSelection, { kind: 'moveUnit' }> =
    selection.kind === 'moveUnit'
      ? selection
      : {
          kind: 'moveUnit',
          unit: undefined,
          destinations: [],
          pendingDestination: undefined,
        };

  if (moveSelection.unit === undefined) {
    return pickMoveUnit({ coordinate, options, moveSelection, state });
  }
  const switched = switchOrClearMoveUnit({
    coordinate,
    options,
    moveSelection,
    state,
  });
  if (switched !== undefined) {
    return switched;
  }
  return stageMoveDestination(moveSelection, coordinate);
}
