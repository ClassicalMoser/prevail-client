import { isCommitChoiceType } from '@application';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';

export function commitHint(
  options: LegalPlayerChoiceOptions | null,
): string | null {
  if (options === null || !isCommitChoiceType(options.choiceType)) {
    return null;
  }
  let phase = 'ranged attack';
  if (options.choiceType === 'commitToMelee') {
    phase = 'melee';
  } else if (options.choiceType === 'commitToMovement') {
    phase = 'movement';
  }
  return `Commit a highlighted hand card to ${phase}.`;
}
