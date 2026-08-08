import type {
  Coordinate,
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';
import { clearRangedAttacker, pickRangedAttacker } from './pickRangedAttacker';
import { pickRangedTarget } from './pickRangedTarget';
import { switchRangedTargetOrToggleSupporter } from './toggleRangedSupporter';

export function handleRangedCellClick(args: {
  coordinate: Coordinate;
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'performRangedAttack' }
  >;
  selection: SeatSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, options, selection, state } = args;
  if (selection.kind !== 'performRangedAttack') {
    return { selection };
  }

  if (selection.attacker === undefined) {
    return pickRangedAttacker({ coordinate, options, selection, state });
  }
  if (selection.attacker.placement.coordinate === coordinate) {
    return clearRangedAttacker({ options });
  }
  if (selection.target === undefined) {
    return pickRangedTarget({ coordinate, selection, state });
  }
  return switchRangedTargetOrToggleSupporter({
    coordinate,
    selection,
    state,
  });
}
