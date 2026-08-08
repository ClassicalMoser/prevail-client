import { formatCombatEngagementLine, isCommitChoiceType } from '@application';
import type { CombatContextView } from '@application';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';

export function commitHint(
  options: LegalPlayerChoiceOptions | null,
  combat?: CombatContextView | null,
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
  if (
    options.choiceType === 'commitToMelee' &&
    combat !== undefined &&
    combat !== null &&
    combat.kind === 'melee'
  ) {
    return `Commit a highlighted hand card to ${formatCombatEngagementLine(combat)}.`;
  }
  return `Commit a highlighted hand card to ${phase}.`;
}
