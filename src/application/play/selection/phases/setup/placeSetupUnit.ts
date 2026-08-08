import type {
  Coordinate,
  LegalPlayerChoiceOptions,
  UnitFacing,
  UnitWithPlacement,
} from '@classicalmoser/prevail-rules/domain';
import { unitKey } from '@application/play/selection/core';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';

export function placeSetupUnit(args: {
  coordinate: Coordinate;
  facing: UnitFacing;
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'setupUnits' }>;
  selection: Extract<SeatSelection, { kind: 'setup' }>;
}): CellClickResult {
  const { coordinate, facing, options, selection } = args;
  if (selection.selectedUnit === undefined) {
    return { selection };
  }
  if (!options.setupUnits.coordinates.includes(coordinate)) {
    return { selection };
  }
  if (selection.placements.some((p) => p.placement.coordinate === coordinate)) {
    return { selection };
  }

  const placement: UnitWithPlacement = {
    unit: selection.selectedUnit,
    placement: { coordinate, facing },
  };
  const placements = [...selection.placements, placement];
  const remaining = options.setupUnits.units.filter(
    (unit) => !placements.some((p) => unitKey(p.unit) === unitKey(unit)),
  );

  if (remaining.length === 0) {
    return {
      selection: {
        kind: 'setup',
        selectedUnit: undefined,
        placements,
        awaitingCommander: true,
        commanderCoordinate: undefined,
      },
    };
  }

  return {
    selection: {
      kind: 'setup',
      selectedUnit: remaining[0],
      placements,
      awaitingCommander: false,
      commanderCoordinate: undefined,
    },
  };
}
