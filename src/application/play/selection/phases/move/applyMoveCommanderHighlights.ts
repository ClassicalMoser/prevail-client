import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { HighlightDraft } from '@application/play/selection/core/highlightDraft';

export function applyMoveCommanderHighlights(
  draft: HighlightDraft,
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveCommander' }>,
): void {
  const { cells } = draft;
  if (options.startingCoordinate !== null) {
    cells[options.startingCoordinate] = 'selected';
  }
  for (const coordinate of options.destinations) {
    cells[coordinate] = 'legal';
  }
}
