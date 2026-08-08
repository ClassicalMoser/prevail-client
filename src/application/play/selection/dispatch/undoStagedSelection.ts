import type {
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '../core/types';
import { undoIssueCommand } from '../phases/issueCommand/undoIssueCommand';
import { undoMoveUnit } from '../phases/move/undoMoveUnit';
import { undoRanged } from '../phases/ranged/undoRanged';
import { undoRout } from '../phases/rout/undoRout';
import { undoSetup } from '../phases/setup/undoSetup';
import { undoSupport } from '../phases/support/undoSupport';

/**
 * Undo one stage of the current choice draft (last setup placement, issue
 * picks, move-unit target, etc.). Does not touch server state.
 */
export function undoStagedSelection(
  selection: SeatSelection,
  options: LegalPlayerChoiceOptions | null,
  state: GameState | undefined,
): SeatSelection {
  if (options === null) {
    return selection;
  }

  switch (selection.kind) {
    case 'setup': {
      return undoSetup(selection, options);
    }
    case 'issueCommand': {
      return undoIssueCommand(selection, options, state);
    }
    case 'performRangedAttack': {
      return undoRanged(selection, options, state);
    }
    case 'moveUnit': {
      return undoMoveUnit(selection);
    }
    case 'routDiscard': {
      return undoRout();
    }
    case 'assignUnitSupport': {
      return undoSupport(selection);
    }
    default: {
      return selection;
    }
  }
}
