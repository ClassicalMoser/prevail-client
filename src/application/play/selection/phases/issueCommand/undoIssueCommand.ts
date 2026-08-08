import type {
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';
import { selectionForOptions } from '@application/play/selection/dispatch/selectionForOptions';
import { initialIssueCommandSelection } from './initialSelection';
import { selectIssueCommand } from './selectIssueCommand';

export function undoIssueCommand(
  selection: Extract<SeatSelection, { kind: 'issueCommand' }>,
  options: LegalPlayerChoiceOptions,
  state: GameState | undefined,
): SeatSelection {
  if (options.choiceType !== 'issueCommand' || state === undefined) {
    return selectionForOptions(options);
  }
  if (selection.selected.length > 0 || selection.lineStart !== undefined) {
    if (selection.command === undefined) {
      return initialIssueCommandSelection();
    }
    return selectIssueCommand(options, selection.command, state);
  }
  return initialIssueCommandSelection();
}
