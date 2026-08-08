import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { HighlightDraft } from '@application/play/selection/core/highlightDraft';

export function applyCommitCardHighlights(
  draft: HighlightDraft,
  options: Extract<
    LegalPlayerChoiceOptions,
    {
      choiceType: 'commitToMelee' | 'commitToMovement' | 'commitToRangedAttack';
    }
  >,
): void {
  for (const event of options.events) {
    if (typeof event.committedCard === 'object' && event.committedCard) {
      draft.cardIds[event.committedCard.id] = 'legal';
    }
  }
}
