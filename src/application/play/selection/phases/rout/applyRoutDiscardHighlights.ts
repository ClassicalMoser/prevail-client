import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { HighlightDraft } from '@application/play/selection/core/highlightDraft';
import type { SeatSelection } from '@application/play/selection/core/types';

export function applyRoutDiscardHighlights(
  draft: HighlightDraft,
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'chooseRoutDiscard' }
  >,
  selection: SeatSelection,
): void {
  for (const id of options.routDiscard.cardIds) {
    draft.cardIds[id] =
      selection.kind === 'routDiscard' && selection.selectedCardIds.includes(id)
        ? 'selected'
        : 'legal';
  }
}
