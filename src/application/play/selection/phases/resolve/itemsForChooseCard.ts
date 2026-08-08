import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { ChoiceListItem } from '@application/play/selection/core/types';

export function itemsForChooseCard(
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'chooseCard' }>,
): ChoiceListItem[] {
  return options.events.map((event) => ({
    id: event.card.id,
    label: event.card.name,
    event,
  }));
}
