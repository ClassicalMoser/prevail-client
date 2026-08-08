import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';

function unitKey(unit: {
  playerSide: string;
  unitType: { id: string };
  instanceNumber: number;
}): string {
  return `${unit.playerSide}:${unit.unitType.id}:${unit.instanceNumber}`;
}

/**
 * Confirm only when assignment is maximal: every unused support slot has no
 * remaining eligible uncovered unit it could still cover.
 */
export function canConfirmAssignUnitSupport(
  selection: SeatSelection,
  options: LegalPlayerChoiceOptions | null,
): boolean {
  if (
    selection.kind !== 'assignUnitSupport' ||
    options?.choiceType !== 'assignUnitSupport'
  ) {
    return false;
  }

  const covered = new Set<string>();
  const usedByCard = new Map<string, number>();
  for (const assignment of selection.assignments) {
    usedByCard.set(assignment.cardId, assignment.units.length);
    for (const unit of assignment.units) {
      covered.add(unitKey(unit));
    }
  }

  for (const grant of options.unitSupportGrants.grants) {
    const used = usedByCard.get(grant.card.id) ?? 0;
    const remaining = grant.unitSupport.count - used;
    if (remaining <= 0) {
      continue;
    }
    const canCoverMore = grant.eligibleUnits.some(
      (unit) => !covered.has(unitKey(unit)),
    );
    if (canCoverMore) {
      return false;
    }
  }

  return true;
}
