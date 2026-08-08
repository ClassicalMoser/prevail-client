import type {
  Coordinate,
  GameState,
} from '@classicalmoser/prevail-rules/domain';
import {
  getLegalRangedAttackSupporters,
  getLegalRangedAttackTargets,
} from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';

type RangedSelection = Extract<SeatSelection, { kind: 'performRangedAttack' }>;

/** Switch target if click hits another legal target; else undefined. */
export function switchRangedTarget(args: {
  coordinate: Coordinate;
  selection: RangedSelection;
  state: GameState;
}): CellClickResult | undefined {
  const { coordinate, selection, state } = args;
  if (selection.attacker === undefined || selection.target === undefined) {
    return { selection };
  }
  const targets = getLegalRangedAttackTargets(selection.attacker, state);
  const newTarget = targets.find(
    (candidate) => candidate.placement.coordinate === coordinate,
  );
  if (
    newTarget === undefined ||
    newTarget.placement.coordinate === selection.target.placement.coordinate
  ) {
    return undefined;
  }
  const nextSupporters = getLegalRangedAttackSupporters(
    selection.attacker,
    newTarget,
    state,
  );
  return {
    selection: {
      kind: 'performRangedAttack',
      attacker: selection.attacker,
      target: newTarget,
      supporters: [],
      legalUnitCoordinates: [
        ...targets.map((u) => u.placement.coordinate),
        ...nextSupporters.map((u) => u.placement.coordinate),
      ],
    },
  };
}
