import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { ChoiceListItem } from '@application/play/selection/core/types';

export function itemsForMeleeResolution(
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'chooseMeleeResolution' }
  >,
): ChoiceListItem[] {
  return options.events.map((event) => ({
    id: event.space,
    label: `Resolve ${event.space}`,
    event,
  }));
}
