import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { ChoiceListItem } from '@application/play/selection/core/types';

export function itemsForRally(
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'chooseRally' }>,
): ChoiceListItem[] {
  return options.events.map((event, index) => ({
    id: `rally-${index}`,
    label: event.performRally ? 'Rally' : 'Skip rally',
    event,
  }));
}
