import type {
  Coordinate,
  LegalPlayerChoiceOptions,
  UnitFacing,
} from '@classicalmoser/prevail-rules/domain';
import type { CellClickResult, SeatSelection } from '../core/types';
import { handleMoveUnitFacingClick } from '../phases/move';
import { handleSetupFacingClick } from '../phases/setup';

/**
 * Place the selected setup unit by choosing a facing arrow on a legal cell.
 */
export function handleFacingClick(args: {
  coordinate: Coordinate;
  facing: UnitFacing;
  options: LegalPlayerChoiceOptions | null;
  selection: SeatSelection;
}): CellClickResult {
  const { coordinate, facing, options, selection } = args;
  if (options === null) {
    return { selection };
  }

  if (options.choiceType === 'setupUnits') {
    return handleSetupFacingClick({ coordinate, facing, options, selection });
  }

  if (options.choiceType === 'moveUnit') {
    return handleMoveUnitFacingClick({
      coordinate,
      facing,
      options,
      selection,
    });
  }

  return { selection };
}
