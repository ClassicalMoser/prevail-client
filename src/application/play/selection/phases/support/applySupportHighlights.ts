import {
  getOwnedPlayerCardState,
  getPositionOfUnit,
} from '@classicalmoser/prevail-rules/domain';
import type {
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { unitKey } from '@application/play/selection/core';
import type { SeatSelection } from '@application/play/selection/core/types';
import type { HighlightDraft } from '@application/play/selection/core/highlightDraft';
import { supportKind } from './supportKind';

export function applySupportHighlights(
  draft: HighlightDraft,
  source: {
    options: Extract<
      LegalPlayerChoiceOptions,
      { choiceType: 'assignUnitSupport' }
    >;
    selection: SeatSelection;
    state: GameState | undefined;
  },
): void {
  const { options, selection, state } = source;
  if (state === undefined) {
    return;
  }

  const support = options.assignUnitSupport;
  const { cardIds, cells } = draft;
  const activeKind =
    selection.kind === 'assignUnitSupport' &&
    selection.activeSupport !== undefined
      ? supportKind(selection.activeSupport)
      : undefined;

  try {
    const hand = getOwnedPlayerCardState(
      state.cardState,
      support.player,
    ).inHand;
    for (const card of hand) {
      if (card.unitSupport.count >= 1) {
        const kind = supportKind(card.unitSupport);
        const offered = support.categories.some(
          (category) => supportKind(category.unitSupport) === kind,
        );
        if (offered) {
          cardIds[card.id] = kind === activeKind ? 'selected' : 'legal';
        }
      }
    }
  } catch {
    // Opponent view hides this hand.
  }

  if (selection.kind !== 'assignUnitSupport') {
    return;
  }

  const covered = new Set(
    selection.assignments.flatMap((assignment) =>
      assignment.units.map(unitKey),
    ),
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

  const activeCategory = support.categories.find(
    (category) => supportKind(category.unitSupport) === activeKind,
  );
  if (activeCategory === undefined) {
    return;
  }
  for (const unit of activeCategory.eligibleUnits) {
    if (!covered.has(unitKey(unit))) {
      try {
        cells[getPositionOfUnit(state.boardState, unit).coordinate] = 'legal';
      } catch {
        // Unit already off the board.
      }
    }
  }
}
