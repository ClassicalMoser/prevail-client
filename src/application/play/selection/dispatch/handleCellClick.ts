import type {
  Coordinate,
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type { CellClickResult, SeatSelection } from '../core/types';
import { handleIssueCommandCellClick } from '../phases/issueCommand';
import {
  handleMoveCommanderCellClick,
  handleMoveUnitCellClick,
} from '../phases/move';
import { handleRangedCellClick } from '../phases/ranged';
import {
  chooseMeleeCellClick,
  chooseRetreatCellClick,
} from '../phases/resolve';
import { handleSetupCellClick } from '../phases/setup';
import { handleSupportCellClick } from '../phases/support';

export function handleCellClick(args: {
  coordinate: Coordinate;
  options: LegalPlayerChoiceOptions | null;
  selection: SeatSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, options, selection, state } = args;
  if (options === null) {
    return { selection };
  }

  switch (options.choiceType) {
    case 'setupUnits': {
      return handleSetupCellClick({ coordinate, options, selection });
    }
    case 'moveCommander': {
      return handleMoveCommanderCellClick({
        coordinate,
        options,
        selection,
        state,
      });
    }
    case 'moveUnit': {
      return handleMoveUnitCellClick({
        coordinate,
        options,
        selection,
        state,
      });
    }
    case 'assignUnitSupport': {
      return handleSupportCellClick({
        coordinate,
        options,
        selection,
        state,
      });
    }
    case 'chooseMeleeResolution': {
      return chooseMeleeCellClick({ coordinate, options, selection });
    }
    case 'chooseRetreatOption': {
      return chooseRetreatCellClick({ coordinate, options, selection });
    }
    case 'issueCommand': {
      return handleIssueCommandCellClick({
        coordinate,
        options,
        selection,
        state,
      });
    }
    case 'performRangedAttack': {
      return handleRangedCellClick({
        coordinate,
        options,
        selection,
        state,
      });
    }
    default: {
      return { selection };
    }
  }
}
