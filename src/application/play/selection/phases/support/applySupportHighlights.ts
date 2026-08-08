import type {
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { getPositionOfUnit } from '@classicalmoser/prevail-rules/domain';
import { unitKey } from '@application/play/selection/core';
import type { SeatSelection } from '@application/play/selection/core/types';
import type { HighlightDraft } from '@application/play/selection/core/highlightDraft';

export function applySupportHighlights(
  draft: HighlightDraft,
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'assignUnitSupport' }
  >,
  selection: SeatSelection,
  state: GameState | undefined,
): void {
  const { cells, cardIds } = draft;
  for (const grant of options.unitSupportGrants.grants) {
    cardIds[grant.card.id] =
      selection.kind === 'assignUnitSupport' &&
      selection.activeCardId === grant.card.id
        ? 'selected'
        : 'legal';
  }
  if (selection.kind !== 'assignUnitSupport' || state === undefined) {
    return;
  }
  const covered = new Set(
    selection.assignments.flatMap((a) => a.units.map(unitKey)),
  );
  for (const assignment of selection.assignments) {
    for (const unit of assignment.units) {
      try {
        cells[getPositionOfUnit(state.boardState, unit).coordinate] =
          'selected';
      } catch {
        // Unit already off the board.
      }
    }
  }
  const activeGrant = options.unitSupportGrants.grants.find(
    (g) => g.card.id === selection.activeCardId,
  );
  if (activeGrant === undefined) {
    return;
  }
  for (const unit of activeGrant.eligibleUnits) {
    if (covered.has(unitKey(unit))) {
      continue;
    }
    try {
      cells[getPositionOfUnit(state.boardState, unit).coordinate] = 'legal';
    } catch {
      // Skip
    }
  }
}
