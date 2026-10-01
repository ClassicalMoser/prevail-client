import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';

export function initialSupportSelection(
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'assignUnitSupport' }
  >,
): SeatSelection {
  return {
    kind: 'assignUnitSupport',
    activeSupport: options.assignUnitSupport.categories[0]?.unitSupport,
    assignments: [],
  };
}
