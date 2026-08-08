import type { SeatSelection } from '../core/types';

/** Whether the staged seat selection has something to undo. */
export function hasStagedUndo(selection: SeatSelection): boolean {
  switch (selection.kind) {
    case 'setup': {
      return selection.placements.length > 0;
    }
    case 'issueCommand': {
      return (
        selection.selected.length > 0 ||
        selection.lineStart !== undefined ||
        selection.command !== undefined
      );
    }
    case 'performRangedAttack': {
      return (
        selection.attacker !== undefined ||
        selection.target !== undefined ||
        selection.supporters.length > 0
      );
    }
    case 'moveUnit': {
      return selection.unit !== undefined;
    }
    case 'routDiscard': {
      return selection.selectedCardIds.length > 0;
    }
    case 'assignUnitSupport': {
      return (
        selection.assignments.some((a) => a.units.length > 0) ||
        selection.activeCardId !== undefined
      );
    }
    default: {
      return false;
    }
  }
}
