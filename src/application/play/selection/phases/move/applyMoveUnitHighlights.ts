import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { facingsForCoordinate } from '@application/play/selection/core';
import type { SeatSelection } from '@application/play/selection/core/types';
import type { HighlightDraft } from '@application/play/selection/core/highlightDraft';

export function applyMoveUnitHighlights(
  draft: HighlightDraft,
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }>,
  selection: SeatSelection,
): void {
  const { cells, facingPickerCells, facingPickerFacings } = draft;
  if (selection.kind === 'moveUnit' && selection.unit !== undefined) {
    cells[selection.unit.placement.coordinate] = 'selected';
    for (const destination of selection.destinations) {
      cells[destination.coordinate] = 'legal';
    }
    const pending = selection.pendingDestination;
    if (pending !== undefined) {
      cells[pending] = 'selected';
      facingPickerCells.add(pending);
      facingPickerFacings[pending] = facingsForCoordinate(
        selection.destinations,
        pending,
      );
    }
    return;
  }
  for (const unit of options.moveUnits.units) {
    cells[unit.placement.coordinate] = 'legal';
  }
}
