import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application';

export function assignUnitSupportHint(
  options: LegalPlayerChoiceOptions | null,
  selection: SeatSelection,
): string | null {
  if (options?.choiceType !== 'assignUnitSupport') {
    return null;
  }
  const covered =
    selection.kind === 'assignUnitSupport'
      ? selection.assignments.reduce((n, a) => n + a.units.length, 0)
      : 0;
  const slots = options.unitSupportGrants.grants.reduce(
    (n, g) => n + g.unitSupport.count,
    0,
  );
  return `Assign hand support to units (use every usable slot; uncovered units rout). Tap a support card, then units · ${covered}/${slots} slots used — Confirm when maximal.`;
}
