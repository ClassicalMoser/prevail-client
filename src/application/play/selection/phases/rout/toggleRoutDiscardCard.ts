import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
} from '@classicalmoser/prevail-rules/domain';
import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';

export function toggleRoutDiscardCard(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
  cardId: string,
): { selection: SeatSelection; submit?: PlayerChoiceEvent } {
  if (
    options.choiceType !== 'chooseRoutDiscard' ||
    selection.kind !== 'routDiscard'
  ) {
    return { selection };
  }
  if (!options.routDiscard.cardIds.includes(cardId)) {
    return { selection };
  }

  const selected = selection.selectedCardIds.includes(cardId)
    ? selection.selectedCardIds.filter((id) => id !== cardId)
    : [...selection.selectedCardIds, cardId];

  if (selected.length === options.routDiscard.numberToDiscard) {
    return {
      selection: { kind: 'routDiscard', selectedCardIds: selected },
      submit: {
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        choiceType: 'chooseRoutDiscard',
        eventNumber: options.expectedEventNumber,
        player: options.routDiscard.player,
        cardIds: selected,
      },
    };
  }

  return { selection: { kind: 'routDiscard', selectedCardIds: selected } };
}
