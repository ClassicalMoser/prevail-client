import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { formatCombatEngagementLine } from '../combatContextFromState';
import type { CombatContextView } from '../combatContextFromState';
import { isCommitChoiceType } from '../selection';

/** Copy for a commit choice, or undefined when the seat is not committing. */
function commitHint(
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
    const engagement = formatCombatEngagementLine(combat);
    const hint = `Commit a highlighted hand card to ${engagement}.`;
    return hint;
  }
  const hint = `Commit a highlighted hand card to ${phase}.`;
  return hint;
}

export { commitHint };
