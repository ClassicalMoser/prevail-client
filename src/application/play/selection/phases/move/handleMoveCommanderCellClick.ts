import type {
  Coordinate,
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import { concretePlayer } from '@application/play/selection/core';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';

export function handleMoveCommanderCellClick(args: {
  coordinate: Coordinate;
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveCommander' }>;
  selection: SeatSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, options, selection, state } = args;
  if (
    options.startingCoordinate === null ||
    !options.destinations.includes(coordinate)
  ) {
    return { selection };
  }
  return {
    selection,
    submit: {
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      choiceType: 'moveCommander',
      eventNumber: options.expectedEventNumber,
      player: concretePlayer(options, state),
      from: options.startingCoordinate,
      to: coordinate,
    },
  };
}
