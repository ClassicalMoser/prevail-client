import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { HighlightDraft } from '@application/play/selection/core/highlightDraft';

function applyMeleeResolutionHighlights(
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

function applyRetreatOptionHighlights(
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

export { applyMeleeResolutionHighlights, applyRetreatOptionHighlights };
