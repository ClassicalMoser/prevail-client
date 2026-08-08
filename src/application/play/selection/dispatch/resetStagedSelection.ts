import type {
  GameState,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import { emptySelection } from '../core/emptySelection';
import type { SeatSelection } from '../core/types';
import {
  initialIssueCommandSelection,
  selectIssueCommand,
} from '../phases/issueCommand';
import { selectionForOptions } from './selectionForOptions';

/** Drop the draft and rebuild the default selection for the current options. */
export function resetStagedSelection(
  options: LegalPlayerChoiceOptions | null,
  state?: GameState,
): SeatSelection {
  if (options === null) {
    return emptySelection();
  }
  if (options.choiceType === 'issueCommand' && state !== undefined) {
    const commands = options.issueCommands.commands;
    if (commands.length === 1) {
      const only = commands[0];
      if (only !== undefined) {
        return selectIssueCommand(options, only, state);
      }
    }
    return initialIssueCommandSelection();
  }
  return selectionForOptions(options);
}
