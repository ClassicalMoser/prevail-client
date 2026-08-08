import type {
  Command,
  Coordinate,
  GameState,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import {
  getLegalLineEndsForIssueCommand,
  getLegalUnitsForIssueCommand,
} from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';

type IssueSelection = Extract<SeatSelection, { kind: 'issueCommand' }>;

export function pickLineStart(args: {
  coordinate: Coordinate;
  command: Command;
  player: PlayerSide;
  issueSelection: IssueSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, command, player, issueSelection, state } = args;
  const starts = getLegalUnitsForIssueCommand(command, player, state);
  const start = starts.find((u) => u.placement.coordinate === coordinate);
  if (start === undefined) {
    return { selection: issueSelection };
  }
  const ends = getLegalLineEndsForIssueCommand(command, player, state, start);
  return {
    selection: {
      ...issueSelection,
      lineStart: start,
      selected: [],
      legalUnitCoordinates: ends.map((u) => u.placement.coordinate),
    },
  };
}
