import type {
  Board,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type { ChoiceListItem } from '@application/play/selection/core/types';
import { engagementLabelAtCoordinate } from '@application/play/combatContextFromState';

export function itemsForMeleeResolution(
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'chooseMeleeResolution' }
  >,
  board?: Board,
): ChoiceListItem[] {
  return options.events.map((event) => ({
    id: event.space,
    label: engagementLabelAtCoordinate(board, event.space),
    event,
  }));
}
