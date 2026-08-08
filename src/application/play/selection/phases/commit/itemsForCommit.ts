import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { ChoiceListItem } from '@application/play/selection/core/types';

export function itemsForCommit(
  options: Extract<
    LegalPlayerChoiceOptions,
    {
      choiceType: 'commitToMelee' | 'commitToMovement' | 'commitToRangedAttack';
    }
  >,
): ChoiceListItem[] {
  return options.events.map((event) => {
    if (event.committedCard === null) {
      return {
        id: `commit-refuse-${options.choiceType}`,
        label: "Don't commit",
        event,
      };
    }
    return {
      id: event.committedCard.id,
      label: event.committedCard.name,
      event,
    };
  });
}
