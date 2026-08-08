import type { SeatSelection } from '@application/play/selection/core/types';
import type { HighlightDraft } from '@application/play/selection/core/highlightDraft';

export function applyRangedHighlights(
  draft: HighlightDraft,
  selection: SeatSelection,
): void {
  if (selection.kind !== 'performRangedAttack') {
    return;
  }
  const { cells } = draft;
  for (const coordinate of selection.legalUnitCoordinates) {
    cells[coordinate] = 'legal';
  }
  if (selection.attacker !== undefined) {
    cells[selection.attacker.placement.coordinate] = 'selected';
  }
  if (selection.target !== undefined) {
    cells[selection.target.placement.coordinate] = 'selected';
  }
  for (const supporter of selection.supporters) {
    cells[supporter.placement.coordinate] = 'selected';
  }
}
