import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { unitFacings } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';
import type { HighlightDraft } from '@application/play/selection/core/highlightDraft';

export function applySetupHighlights(
  draft: HighlightDraft,
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'setupUnits' }>,
  selection: SeatSelection,
): void {
  const { cells, facingPickerCells, facingPickerFacings } = draft;
  if (selection.kind === 'setup' && selection.awaitingCommander) {
    for (const coordinate of options.setupUnits.coordinates) {
      cells[coordinate] = 'legal';
    }
    return;
  }
  const placed = new Set(
    selection.kind === 'setup'
      ? selection.placements.map((p) => p.placement.coordinate)
      : [],
  );
  for (const coordinate of options.setupUnits.coordinates) {
    if (placed.has(coordinate)) {
      cells[coordinate] = 'selected';
      continue;
    }
    cells[coordinate] = 'legal';
    if (selection.kind === 'setup' && selection.selectedUnit !== undefined) {
      facingPickerCells.add(coordinate);
      facingPickerFacings[coordinate] = unitFacings;
    }
  }
}
