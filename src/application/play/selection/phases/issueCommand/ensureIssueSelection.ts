import type {
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';
import { selectIssueCommand } from './selectIssueCommand';

type IssueSelection = Extract<SeatSelection, { kind: 'issueCommand' }>;

/** Recover drifted draft; auto-pick when only one remaining slot. */
export function ensureIssueSelection(
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'issueCommand' }>,
  selection: SeatSelection,
  state: GameState,
): IssueSelection {
  const issueSelection: IssueSelection =
    selection.kind === 'issueCommand'
      ? selection
      : {
          kind: 'issueCommand',
          command: undefined,
          selected: [],
          lineStart: undefined,
          legalUnitCoordinates: [],
        };

  if (issueSelection.command !== undefined) {
    return issueSelection;
  }
  const commands = options.issueCommands.commands;
  if (commands.length === 1 && commands[0] !== undefined) {
    return selectIssueCommand(options, commands[0], state) as IssueSelection;
  }
  return issueSelection;
}
