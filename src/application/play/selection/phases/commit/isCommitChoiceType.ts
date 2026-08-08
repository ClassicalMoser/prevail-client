import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';

export function isCommitChoiceType(
  choiceType: LegalPlayerChoiceOptions['choiceType'],
): boolean {
  return (
    choiceType === 'commitToMelee' ||
    choiceType === 'commitToMovement' ||
    choiceType === 'commitToRangedAttack'
  );
}
