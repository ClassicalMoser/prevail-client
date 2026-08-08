import type {
  Coordinate,
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { isSameUnitInstance } from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';
import { toggleUnitOnActiveCard } from './toggleUnitOnActiveCard';
import { unitAtCoordinate } from './unitAtCoordinate';

export function handleSupportCellClick(args: {
  coordinate: Coordinate;
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'assignUnitSupport' }
  >;
  selection: SeatSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, options, state } = args;
  const selection: Extract<SeatSelection, { kind: 'assignUnitSupport' }> =
    args.selection.kind === 'assignUnitSupport'
      ? args.selection
      : {
          kind: 'assignUnitSupport',
          activeCardId: options.unitSupportGrants.grants[0]?.card.id,
          assignments: [],
        };

  if (selection.activeCardId === undefined) {
    return { selection };
  }
  const grant = options.unitSupportGrants.grants.find(
    (g) => g.card.id === selection.activeCardId,
  );
  if (grant === undefined) {
    return { selection };
  }

  const spaceUnit = unitAtCoordinate(
    state,
    coordinate,
    options.unitSupportGrants.player,
  );
  if (spaceUnit === undefined) {
    return { selection };
  }
  const eligible = grant.eligibleUnits.some(
    (u) => isSameUnitInstance(u, spaceUnit).result,
  );
  if (!eligible) {
    return { selection };
  }
  return toggleUnitOnActiveCard({ selection, spaceUnit, grant });
}
