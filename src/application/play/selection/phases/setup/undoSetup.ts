import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { unitKey } from '@application/play/selection/core';
import type { SeatSelection } from '@application/play/selection/core/types';

export function undoSetup(
  selection: Extract<SeatSelection, { kind: 'setup' }>,
  options: LegalPlayerChoiceOptions,
): SeatSelection {
  if (
    options.choiceType !== 'setupUnits' ||
    selection.placements.length === 0
  ) {
    return selection;
  }
  const placements = selection.placements.slice(0, -1);
  const remaining = options.setupUnits.units.filter(
    (unit) => !placements.some((p) => unitKey(p.unit) === unitKey(unit)),
  );
  return {
    kind: 'setup',
    selectedUnit: remaining.find(() => true),
    placements,
    awaitingCommander: false,
    commanderCoordinate: undefined,
  };
}
