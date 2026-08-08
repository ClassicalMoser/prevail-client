import type { UnitInstance } from '@classicalmoser/prevail-rules/domain';
import { unitKey } from '@application/play/selection/core';

export type SetupUnitTypeGroup = {
  typeId: string;
  version: string;
  name: string;
  remaining: number;
  total: number;
  /** Next instance to select: first unplaced, else first of type (reposition). */
  pick: UnitInstance;
};

/**
 * Collapse setup roster to one row per unit type with remaining-to-place count.
 */
export function setupUnitsByType(
  units: readonly UnitInstance[],
  placed: readonly UnitInstance[],
): SetupUnitTypeGroup[] {
  const placedKeys = new Set(placed.map(unitKey));
  const groups: SetupUnitTypeGroup[] = [];
  const indexByType = new Map<string, number>();

  for (const unit of units) {
    const typeId = unit.unitType.id;
    const existing = indexByType.get(typeId);
    if (existing === undefined) {
      indexByType.set(typeId, groups.length);
      groups.push({
        typeId,
        version: unit.unitType.version,
        name: unit.unitType.name,
        remaining: placedKeys.has(unitKey(unit)) ? 0 : 1,
        total: 1,
        pick: unit,
      });
      continue;
    }

    const group = groups[existing];
    if (group === undefined) {
      continue;
    }
    group.total += 1;
    const isPlaced = placedKeys.has(unitKey(unit));
    if (!isPlaced) {
      group.remaining += 1;
      if (placedKeys.has(unitKey(group.pick))) {
        group.pick = unit;
      }
    }
  }

  return groups;
}
