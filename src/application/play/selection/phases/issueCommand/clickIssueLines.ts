import type {
  Command,
  Coordinate,
  GameState,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';
import { pickLineEnd } from './pickLineEnd';
import { pickLineStart } from './pickLineStart';

type IssueSelection = Extract<SeatSelection, { kind: 'issueCommand' }>;

export function clickIssueLines(args: {
  coordinate: Coordinate;
  command: Command;
  player: PlayerSide;
  issueSelection: IssueSelection;
  state: GameState;
}): CellClickResult {
  if (args.issueSelection.lineStart === undefined) {
    return pickLineStart(args);
  }
  return pickLineEnd(args);
}
