import type {
  Coordinate,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { defaultFacingForSide } from '@application/play/selection/core/defaultFacingForSide';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';
import { buildSetupSubmit } from './buildSetupSubmit';
import { placeSetupUnit } from './placeSetupUnit';
import { selectSetupUnit } from './selectSetupUnit';

export function handleSetupCellClick(args: {
  coordinate: Coordinate;
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'setupUnits' }>;
  selection: SeatSelection;
}): CellClickResult {
  const { coordinate, options, selection } = args;
  if (selection.kind !== 'setup') {
    return { selection };
  }
  if (!selection.awaitingCommander) {
    const staged = selection.placements.find(
      (p) => p.placement.coordinate === coordinate,
    );
    if (staged !== undefined) {
      return {
        selection: selectSetupUnit(selection, staged.unit),
      };
    }
    if (
      selection.selectedUnit === undefined ||
      !options.setupUnits.coordinates.includes(coordinate)
    ) {
      return { selection };
    }
    return placeSetupUnit({
      coordinate,
      facing: defaultFacingForSide(options.setupUnits.player),
      options,
      selection,
    });
  }
  if (!options.setupUnits.coordinates.includes(coordinate)) {
    return { selection };
  }
  return {
    selection,
    submit: buildSetupSubmit(options, selection.placements, coordinate),
  };
}
