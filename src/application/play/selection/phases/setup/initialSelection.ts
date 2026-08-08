import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';

export function initialSetupSelection(
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'setupUnits' }>,
): SeatSelection {
  return {
    kind: 'setup',
    selectedUnit: options.setupUnits.units[0],
    placements: [],
    awaitingCommander: false,
    commanderCoordinate: undefined,
  };
}
