import type {
  Command,
  Coordinate,
  GameState,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import {
  getLegalLineEndsForIssueCommand,
  getLineSegmentFromStart,
} from '@classicalmoser/prevail-rules/domain';
import { lineUnitsFromStartToEnd } from '@application/play/selection/core';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';

type IssueSelection = Extract<SeatSelection, { kind: 'issueCommand' }>;

export function pickLineEnd(args: {
  coordinate: Coordinate;
  command: Command;
  player: PlayerSide;
  issueSelection: IssueSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, command, player, issueSelection, state } = args;
  const lineStart = issueSelection.lineStart;
  if (lineStart === undefined) {
    return { selection: issueSelection };
  }
  const ends = getLegalLineEndsForIssueCommand(
    command,
    player,
    state,
    lineStart,
  );
  if (lineStart.placement.coordinate === coordinate) {
    return {
      selection: {
        ...issueSelection,
        selected: [lineStart],
        legalUnitCoordinates: ends.map((u) => u.placement.coordinate),
      },
    };
  }
  const end = ends.find((u) => u.placement.coordinate === coordinate);
  if (end === undefined) {
    return { selection: issueSelection };
  }
  const segment = getLineSegmentFromStart(command, state, lineStart);
  const selected = lineUnitsFromStartToEnd(segment, lineStart, end);
  if (selected === undefined) {
    return { selection: issueSelection };
  }
  return {
    selection: {
      ...issueSelection,
      selected,
      legalUnitCoordinates: ends.map((u) => u.placement.coordinate),
    },
  };
}
