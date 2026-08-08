import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { ChoiceListItem } from '@application/play/selection/core/types';

export function itemsForRetreatOption(
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'chooseRetreatOption' }
  >,
): ChoiceListItem[] {
  return options.events.map((event) => ({
    id: event.retreatOption.coordinate,
    label: `Retreat to ${event.retreatOption.coordinate}`,
    event,
  }));
}

export function itemsForWhetherToRetreat(
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'chooseWhetherToRetreat' }
  >,
): ChoiceListItem[] {
  return options.events.map((event, index) => ({
    id: `retreat-${index}-${String(event.choosesToRetreat)}`,
    label: event.choosesToRetreat ? 'Retreat' : 'Stay',
    event,
  }));
}
