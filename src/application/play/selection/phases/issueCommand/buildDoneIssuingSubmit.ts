import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
} from '@classicalmoser/prevail-rules/domain';
import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';

/**
 * Forfeit remaining issue-command slots.
 * Works for voluntary done while `issueCommand` is expected, and for the
 * forced `doneIssuingCommands` choice when no slot is issuable.
 */
export function buildDoneIssuingSubmit(
  options: LegalPlayerChoiceOptions | null,
): PlayerChoiceEvent | undefined {
  if (options === null) {
    return undefined;
  }
  if (options.choiceType === 'doneIssuingCommands') {
    return options.events[0];
  }
  if (options.choiceType === 'issueCommand' && options.canDoneIssuing) {
    return {
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      choiceType: 'doneIssuingCommands',
      eventNumber: options.expectedEventNumber,
      player: options.issueCommands.player,
    };
  }
  return undefined;
}
