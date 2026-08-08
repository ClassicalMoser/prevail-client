import type {
  Coordinate,
  GameState,
} from '@classicalmoser/prevail-rules/domain';
import {
  getLegalRangedAttackSupporters,
  getLegalRangedAttackTargets,
} from '@classicalmoser/prevail-rules/domain';
import { unitKey } from '@application/play/selection/core';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';
import { switchRangedTarget } from './switchRangedTarget';

type RangedSelection = Extract<SeatSelection, { kind: 'performRangedAttack' }>;

export function switchRangedTargetOrToggleSupporter(args: {
  coordinate: Coordinate;
  selection: RangedSelection;
  state: GameState;
}): CellClickResult {
  const switched = switchRangedTarget(args);
  if (switched !== undefined) {
    return switched;
  }

  const { coordinate, selection, state } = args;
  if (selection.attacker === undefined || selection.target === undefined) {
    return { selection };
  }
  const targets = getLegalRangedAttackTargets(selection.attacker, state);
  const supportersLegal = getLegalRangedAttackSupporters(
    selection.attacker,
    selection.target,
    state,
  );
  const supporterHit = supportersLegal.find(
    (candidate) => candidate.placement.coordinate === coordinate,
  );
  if (supporterHit === undefined) {
    return { selection };
  }
  const already = selection.supporters.some(
    (u) => unitKey(u.unit) === unitKey(supporterHit.unit),
  );
  const supporters = already
    ? selection.supporters.filter(
        (u) => unitKey(u.unit) !== unitKey(supporterHit.unit),
      )
    : [...selection.supporters, supporterHit];
  return {
    selection: {
      ...selection,
      supporters,
      legalUnitCoordinates: [
        ...targets.map((u) => u.placement.coordinate),
        ...supportersLegal.map((u) => u.placement.coordinate),
      ],
    },
  };
}
