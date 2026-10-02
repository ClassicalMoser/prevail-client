import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '../selection';

/** Copy for assign-unit-support, or undefined when that choice is not active. */
function assignUnitSupportHint(
  options: LegalPlayerChoiceOptions | undefined,
  selection: SeatSelection,
): string | undefined {
  if (options?.choiceType !== 'assignUnitSupport') {
    return undefined;
  }
  const covered =
    selection.kind === 'assignUnitSupport'
      ? selection.assignments.reduce((n, a) => n + a.units.length, 0)
      : 0;
  const slots = options.assignUnitSupport.categories.reduce(
    (n, category) => n + category.unitSupport.count,
    0,
  );
  const hint = `Assign summed hand support to units (use every usable slot; uncovered units rout). Tap a support card, then units · ${covered}/${slots} slots used — Confirm when maximal.`;
  return hint;
}

export { assignUnitSupportHint };
