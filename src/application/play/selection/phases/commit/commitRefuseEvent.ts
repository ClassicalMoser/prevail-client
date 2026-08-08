import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
} from '@classicalmoser/prevail-rules/domain';
import { isCommitChoiceType } from './isCommitChoiceType';

/** Refuse commit event (`committedCard: null`), if offered. */
export function commitRefuseEvent(
  options: LegalPlayerChoiceOptions | null,
): PlayerChoiceEvent | undefined {
  if (options === null || !isCommitChoiceType(options.choiceType)) {
    return undefined;
  }
  if (
    options.choiceType !== 'commitToMelee' &&
    options.choiceType !== 'commitToMovement' &&
    options.choiceType !== 'commitToRangedAttack'
  ) {
    return undefined;
  }
  return options.events.find((event) => event.committedCard === null);
}
