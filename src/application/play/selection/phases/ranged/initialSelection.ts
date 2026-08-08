import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';

export function initialRangedSelection(
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'performRangedAttack' }
  >,
): SeatSelection {
  return {
    kind: 'performRangedAttack',
    attacker: undefined,
    target: undefined,
    supporters: [],
    legalUnitCoordinates: options.rangedAttackers.attackers.map(
      (attacker) => attacker.placement.coordinate,
    ),
  };
}
