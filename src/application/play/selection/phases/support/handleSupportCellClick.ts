import { isSameUnitInstance } from '@classicalmoser/prevail-rules/domain';
import type {
  Coordinate,
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';
import { supportKind } from './supportKind';
import { toggleUnitOnActiveCategory } from './toggleUnitOnActiveCategory';
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
  const support = options.assignUnitSupport;
  const selection: Extract<SeatSelection, { kind: 'assignUnitSupport' }> =
    args.selection.kind === 'assignUnitSupport'
      ? args.selection
      : {
          kind: 'assignUnitSupport',
          activeSupport: support.categories[0]?.unitSupport,
          assignments: [],
        };

  const activeSupport = selection.activeSupport;
  if (activeSupport === undefined) {
    return { selection };
  }
  const category = support.categories.find(
    (entry) => supportKind(entry.unitSupport) === supportKind(activeSupport),
  );
  if (category === undefined) {
    return { selection };
  }

  const spaceUnit = unitAtCoordinate(state, coordinate, support.player);
  if (spaceUnit === undefined) {
    return { selection };
  }
  const eligible = category.eligibleUnits.some(
    (unit) => isSameUnitInstance(unit, spaceUnit).result,
  );
  if (!eligible) {
    return { selection };
  }
  return toggleUnitOnActiveCategory({ selection, spaceUnit, category });
}
