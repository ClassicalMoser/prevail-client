import type {
  Coordinate,
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';
import { clickIssueLines } from './clickIssueLines';
import { clickIssueUnits } from './clickIssueUnits';
import { ensureIssueSelection } from './ensureIssueSelection';

export function handleIssueCommandCellClick(args: {
  coordinate: Coordinate;
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'issueCommand' }>;
  selection: SeatSelection;
  state: GameState;
}): CellClickResult {
  const { coordinate, options, selection, state } = args;
  const issueSelection = ensureIssueSelection(options, selection, state);
  const command = issueSelection.command;
  if (command === undefined) {
    return { selection: issueSelection };
  }
  const player = options.issueCommands.player;
  if (command.size === 'lines') {
    return clickIssueLines({
      coordinate,
      command,
      player,
      issueSelection,
      state,
    });
  }
  return clickIssueUnits({
    coordinate,
    command,
    player,
    issueSelection,
    state,
  });
}
