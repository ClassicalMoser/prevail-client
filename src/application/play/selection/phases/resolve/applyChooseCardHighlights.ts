import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { HighlightDraft } from '@application/play/selection/core/highlightDraft';

export function applyChooseCardHighlights(
  draft: HighlightDraft,
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'chooseCard' }>,
): void {
  for (const event of options.events) {
    draft.cardIds[event.card.id] = 'legal';
  }
}
