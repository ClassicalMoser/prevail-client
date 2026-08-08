import type {
  Coordinate,
  LegalPlayerChoiceOptions,
  UnitFacing,
} from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';
import { placeSetupUnit } from './placeSetupUnit';

export function handleSetupFacingClick(args: {
  coordinate: Coordinate;
  facing: UnitFacing;
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'setupUnits' }>;
  selection: SeatSelection;
}): CellClickResult {
  const { coordinate, facing, options, selection } = args;
  if (selection.kind !== 'setup') {
    return { selection };
  }
  return placeSetupUnit({ coordinate, facing, options, selection });
}
