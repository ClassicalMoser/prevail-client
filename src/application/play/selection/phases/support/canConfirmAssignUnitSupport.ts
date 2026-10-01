import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { unitKey } from '@application/play/selection/core';
import type { SeatSelection } from '@application/play/selection/core/types';
import { supportKind } from './supportKind';

/**
 * Confirm only when assignment is maximal: every unused support slot has no
 * remaining eligible uncovered unit it could still cover.
 */
export function canConfirmAssignUnitSupport(
  selection: SeatSelection,
  options: LegalPlayerChoiceOptions | undefined,
): boolean {
  if (
    selection.kind !== 'assignUnitSupport' ||
    options?.choiceType !== 'assignUnitSupport'
  ) {
    return false;
  }

  const covered = new Set<string>();
  const usedByKind = new Map<string, number>();
  for (const assignment of selection.assignments) {
    usedByKind.set(
      supportKind(assignment.unitSupport),
      assignment.units.length,
    );
    for (const unit of assignment.units) {
      covered.add(unitKey(unit));
    }
  }

  for (const category of options.assignUnitSupport.categories) {
    const used = usedByKind.get(supportKind(category.unitSupport)) ?? 0;
    const remaining = category.unitSupport.count - used;
    if (remaining > 0) {
      const canCoverMore = category.eligibleUnits.some(
        (unit) => !covered.has(unitKey(unit)),
      );
      if (canCoverMore) {
        return false;
      }
    }
  }

  return true;
}
