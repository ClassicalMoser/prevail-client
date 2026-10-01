import type {
  LegalPlayerChoiceOptions,
  UnitSupport,
} from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application/play/selection/core/types';
import { supportKind } from './supportKind';

export function selectAssignUnitSupportCard(
  options: LegalPlayerChoiceOptions,
  selection: SeatSelection,
  card: { unitSupport: UnitSupport },
): SeatSelection {
  if (
    options.choiceType !== 'assignUnitSupport' ||
    selection.kind !== 'assignUnitSupport'
  ) {
    return selection;
  }
  const category = options.assignUnitSupport.categories.find(
    (entry) => supportKind(entry.unitSupport) === supportKind(card.unitSupport),
  );
  if (category === undefined) {
    return selection;
  }
  return { ...selection, activeSupport: category.unitSupport };
}
