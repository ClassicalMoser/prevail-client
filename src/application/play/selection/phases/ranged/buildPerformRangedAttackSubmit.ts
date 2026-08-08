import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
} from '@classicalmoser/prevail-rules/domain';
import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';
import { canConfirmPerformRangedAttack } from './canConfirmPerformRangedAttack';

export function buildPerformRangedAttackSubmit(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
): PlayerChoiceEvent | undefined {
  if (
    options.choiceType !== 'performRangedAttack' ||
    selection.kind !== 'performRangedAttack' ||
    selection.attacker === undefined ||
    selection.target === undefined ||
    !canConfirmPerformRangedAttack(selection)
  ) {
    return undefined;
  }
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'performRangedAttack',
    eventNumber: options.expectedEventNumber,
    player: options.rangedAttackers.player,
    unit: selection.attacker,
    targetUnit: selection.target,
    supportingUnits: selection.supporters,
  };
}
