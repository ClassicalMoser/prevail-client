import type { SeatSelection } from '@application/play/selection/core/types';
import type { HighlightDraft } from '@application/play/selection/core/highlightDraft';

export function applyIssueCommandHighlights(
  draft: HighlightDraft,
  selection: SeatSelection,
): void {
  if (selection.kind !== 'issueCommand') {
    return;
  }
  const { cells } = draft;
  for (const coordinate of selection.legalUnitCoordinates) {
    cells[coordinate] = 'legal';
  }
  for (const picked of selection.selected) {
    cells[picked.placement.coordinate] = 'selected';
  }
  if (selection.lineStart !== undefined) {
    cells[selection.lineStart.placement.coordinate] = 'selected';
  }
}
