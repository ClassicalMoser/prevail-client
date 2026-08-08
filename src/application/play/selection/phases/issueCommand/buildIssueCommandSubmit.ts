import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
} from '@classicalmoser/prevail-rules/domain';
import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';
import { canConfirmIssueCommand } from './canConfirmIssueCommand';

export function buildIssueCommandSubmit(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
): PlayerChoiceEvent | undefined {
  if (
    options.choiceType !== 'issueCommand' ||
    selection.kind !== 'issueCommand' ||
    selection.command === undefined ||
    !canConfirmIssueCommand(selection)
  ) {
    return undefined;
  }
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'issueCommand',
    eventNumber: options.expectedEventNumber,
    player: options.issueCommands.player,
    command: selection.command,
    units: selection.selected.map((entry) => entry.unit),
  };
}
