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

export function pickRangedTarget(args: {
  coordinate: Coordinate;
  selection: RangedSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, selection, state } = args;
  if (selection.attacker === undefined) {
    return { selection };
  }
  const targets = getLegalRangedAttackTargets(selection.attacker, state);
  const target = targets.find(
    (candidate) => candidate.placement.coordinate === coordinate,
  );
  if (target === undefined) {
    return { selection };
  }
  const supporters = getLegalRangedAttackSupporters(
    selection.attacker,
    target,
    state,
  );
  return {
    selection: {
      kind: 'performRangedAttack',
      attacker: selection.attacker,
      target,
      supporters: [],
      legalUnitCoordinates: [
        ...targets.map((u) => u.placement.coordinate),
        ...supporters.map((u) => u.placement.coordinate),
      ],
    },
  };
}
