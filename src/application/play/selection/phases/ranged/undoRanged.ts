import type {
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { getLegalRangedAttackTargets } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';
import { selectionForOptions } from '@application/play/selection/dispatch/selectionForOptions';
import { initialRangedSelection } from './initialSelection';

export function undoRanged(
  selection: Extract<SeatSelection, { kind: 'performRangedAttack' }>,
  options: LegalPlayerChoiceOptions,
  state: GameState | undefined,
): SeatSelection {
  if (options.choiceType !== 'performRangedAttack' || state === undefined) {
    return selectionForOptions(options);
  }
  if (selection.target !== undefined || selection.supporters.length > 0) {
    if (selection.attacker === undefined) {
      return initialRangedSelection(options);
    }
    const targets = getLegalRangedAttackTargets(selection.attacker, state);
    return {
      kind: 'performRangedAttack',
      attacker: selection.attacker,
      target: undefined,
      supporters: [],
      legalUnitCoordinates: targets.map((u) => u.placement.coordinate),
    };
  }
  if (selection.attacker !== undefined) {
    return initialRangedSelection(options);
  }
  return selection;
}
