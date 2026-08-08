import type {
  Coordinate,
  LegalPlayerChoiceOptions,
  UnitFacing,
} from '@classicalmoser/prevail-rules/domain';
import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import { cloneDraft } from '@application/authoring';
import { placementForCoordinateAndFacing } from '@application/play/selection/core';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';

export function handleMoveUnitFacingClick(args: {
  coordinate: Coordinate;
  facing: UnitFacing;
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }>;
  selection: SeatSelection;
}): CellClickResult {
  const { coordinate, facing, options, selection } = args;
  if (selection.kind !== 'moveUnit' || selection.unit === undefined) {
    return { selection };
  }
  if (selection.pendingDestination !== coordinate) {
    return { selection };
  }
  const to = placementForCoordinateAndFacing(
    selection.destinations,
    coordinate,
    facing,
  );
  if (to === undefined) {
    return { selection };
  }
  return {
    selection,
    submit: {
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      choiceType: 'moveUnit',
      eventNumber: options.expectedEventNumber,
      player: options.moveUnits.player,
      unit: cloneDraft(selection.unit),
      to: cloneDraft(to),
      moveCommander: false,
    },
  };
}
