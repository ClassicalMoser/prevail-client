import type {
  Coordinate,
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { getLegalRangedAttackTargets } from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';

type RangedSelection = Extract<SeatSelection, { kind: 'performRangedAttack' }>;

export function pickRangedAttacker(args: {
  coordinate: Coordinate;
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'performRangedAttack' }
  >;
  selection: RangedSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, options, selection, state } = args;
  const attacker = options.rangedAttackers.attackers.find(
    (candidate) => candidate.placement.coordinate === coordinate,
  );
  if (attacker === undefined) {
    return { selection };
  }
  const targets = getLegalRangedAttackTargets(attacker, state);
  return {
    selection: {
      kind: 'performRangedAttack',
      attacker,
      target: undefined,
      supporters: [],
      legalUnitCoordinates: targets.map((u) => u.placement.coordinate),
    },
  };
}

export function clearRangedAttacker(args: {
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'performRangedAttack' }
  >;
}): CellClickResult {
  return {
    selection: {
      kind: 'performRangedAttack',
      attacker: undefined,
      target: undefined,
      supporters: [],
      legalUnitCoordinates: args.options.rangedAttackers.attackers.map(
        (u) => u.placement.coordinate,
      ),
    },
  };
}
