import { formatCombatEngagementLine, isCommitChoiceType } from '@application';
import type { CombatContextView } from '@application';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';

/** Copy for a commit choice, or undefined when the seat is not committing. */
export function commitHint(
  options: LegalPlayerChoiceOptions | undefined,
  combat?: CombatContextView,
): string | undefined {
  if (options === undefined || !isCommitChoiceType(options.choiceType)) {
    return undefined;
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
    combat.kind === 'melee'
  ) {
    return `Commit a highlighted hand card to ${formatCombatEngagementLine(combat)}.`;
  }
  return `Commit a highlighted hand card to ${phase}.`;
}
