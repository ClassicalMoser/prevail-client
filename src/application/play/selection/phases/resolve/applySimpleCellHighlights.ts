import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { HighlightDraft } from '@application/play/selection/core/highlightDraft';

export function applyMeleeResolutionHighlights(
  draft: HighlightDraft,
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'chooseMeleeResolution' }
  >,
): void {
  for (const event of options.events) {
    draft.cells[event.space] = 'legal';
  }
}

export function applyRetreatOptionHighlights(
  draft: HighlightDraft,
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'chooseRetreatOption' }
  >,
): void {
  for (const event of options.events) {
    draft.cells[event.retreatOption.coordinate] = 'legal';
  }
}
