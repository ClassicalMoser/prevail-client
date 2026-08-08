import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';

export function selectAssignUnitSupportCard(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
  cardId: string,
): SeatSelection {
  if (
    options.choiceType !== 'assignUnitSupport' ||
    selection.kind !== 'assignUnitSupport'
  ) {
    return selection;
  }
  if (!options.unitSupportGrants.grants.some((g) => g.card.id === cardId)) {
    return selection;
  }
  return { ...selection, activeCardId: cardId };
}
