import type { UnitInstance } from '@classicalmoser/prevail-rules/domain';
import { unitKey } from '@application/play/selection/core';
import type { SeatSelection } from '@application/play/selection/core/types';

/**
 * Select a setup unit to place. If it was already staged, lift it off the
 * board so it can be repositioned (also exits commander-wait).
 */
export function selectSetupUnit(
  selection: SeatSelection,
  unit: UnitInstance,
): SeatSelection {
  if (selection.kind !== 'setup') {
    return selection;
  }
  const placements = selection.placements.filter(
    (p) => unitKey(p.unit) !== unitKey(unit),
  );
  return {
    kind: 'setup',
    selectedUnit: unit,
    placements,
    awaitingCommander: false,
    commanderCoordinate: undefined,
  };
}
