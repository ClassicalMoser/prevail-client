import type { UnitInstance } from '@classicalmoser/prevail-rules/domain';
import { unitKey } from './selection/core';

interface SetupUnitTypeGroup {
  typeId: string;
  version: string;
  name: string;
  remaining: number;
  total: number;
  /** Next instance to select: first unplaced, else first of type (reposition). */
  pick: UnitInstance;
}

/**
 * Collapse setup roster to one row per unit type with remaining-to-place count.
 */
function recordAnotherUnitOfType(
  group: SetupUnitTypeGroup,
  unit: UnitInstance,
  placedKeys: ReadonlySet<string>,
): void {
  group.total += 1;
  const placed = placedKeys.has(unitKey(unit));
  if (placed) {
    return;
  }
  group.remaining += 1;
  if (placedKeys.has(unitKey(group.pick))) {
    group.pick = unit;
  }
}

function setupUnitsByType(
  units: readonly UnitInstance[],
  placed: readonly UnitInstance[],
): SetupUnitTypeGroup[] {
  const placedKeys = new Set(placed.map((unit) => unitKey(unit)));
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
    } else {
      const group = groups[existing];
      if (group !== undefined) {
        recordAnotherUnitOfType(group, unit, placedKeys);
      }
    }
  }

  return groups;
}

export { type SetupUnitTypeGroup, setupUnitsByType };
