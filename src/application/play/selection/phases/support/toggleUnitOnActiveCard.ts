import type {
  LegalPlayerChoiceOptions,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import { isSameUnitInstance } from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';

type SupportSelection = Extract<SeatSelection, { kind: 'assignUnitSupport' }>;
type Grant = Extract<
  LegalPlayerChoiceOptions,
  { choiceType: 'assignUnitSupport' }
>['unitSupportGrants']['grants'][number];

export function toggleUnitOnActiveCard(args: {
  selection: SupportSelection;
  spaceUnit: UnitInstance;
  grant: Grant;
}): CellClickResult {
  const { selection, spaceUnit, grant } = args;
  const activeCardId = selection.activeCardId;
  if (activeCardId === undefined) {
    return { selection };
  }

  const withoutUnit = selection.assignments
    .map((assignment) => ({
      cardId: assignment.cardId,
      units: assignment.units.filter(
        (u) => !isSameUnitInstance(u, spaceUnit).result,
      ),
    }))
    .filter((assignment) => assignment.units.length > 0);

  const active = withoutUnit.find((a) => a.cardId === activeCardId);
  const wasOnActive =
    selection.assignments
      .find((a) => a.cardId === activeCardId)
      ?.units.some((u) => isSameUnitInstance(u, spaceUnit).result) === true;

  if (wasOnActive) {
    return {
      selection: { ...selection, assignments: withoutUnit },
    };
  }

  const currentCount = active?.units.length ?? 0;
  if (currentCount >= grant.unitSupport.count) {
    return { selection };
  }

  const nextActive = {
    cardId: activeCardId,
    units: [...(active?.units ?? []), spaceUnit],
  };
  const assignments = [
    ...withoutUnit.filter((a) => a.cardId !== activeCardId),
    nextActive,
  ];
  return { selection: { ...selection, assignments } };
}
