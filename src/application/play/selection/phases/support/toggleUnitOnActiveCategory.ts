import { isSameUnitInstance } from '@classicalmoser/prevail-rules/domain';
import type {
  LegalPlayerChoiceOptions,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import type {
  CellClickResult,
  SeatSelection,
} from '@application/play/selection/core/types';
import { supportKind } from './supportKind';

type SupportSelection = Extract<SeatSelection, { kind: 'assignUnitSupport' }>;
type SupportCategory = Extract<
  LegalPlayerChoiceOptions,
  { choiceType: 'assignUnitSupport' }
>['assignUnitSupport']['categories'][number];

export function toggleUnitOnActiveCategory(args: {
  selection: SupportSelection;
  spaceUnit: UnitInstance;
  category: SupportCategory;
}): CellClickResult {
  const { category, selection, spaceUnit } = args;
  const active = selection.activeSupport;
  if (
    active === undefined ||
    supportKind(active) !== supportKind(category.unitSupport)
  ) {
    return { selection };
  }

  const withoutUnit = selection.assignments
    .map((assignment) => ({
      unitSupport: assignment.unitSupport,
      units: assignment.units.filter(
        (unit) => !isSameUnitInstance(unit, spaceUnit).result,
      ),
    }))
    .filter((assignment) => assignment.units.length > 0);

  const wasOnActive =
    selection.assignments
      .find(
        (assignment) =>
          supportKind(assignment.unitSupport) === supportKind(active),
      )
      ?.units.some((unit) => isSameUnitInstance(unit, spaceUnit).result) ===
    true;

  if (wasOnActive) {
    return { selection: { ...selection, assignments: withoutUnit } };
  }

  const activeAssignment = withoutUnit.find(
    (assignment) =>
      supportKind(assignment.unitSupport) === supportKind(category.unitSupport),
  );
  if ((activeAssignment?.units.length ?? 0) >= category.unitSupport.count) {
    return { selection };
  }

  const nextActive = {
    unitSupport: category.unitSupport,
    units: [...(activeAssignment?.units ?? []), spaceUnit],
  };
  const assignments = [
    ...withoutUnit.filter(
      (assignment) =>
        supportKind(assignment.unitSupport) !==
        supportKind(category.unitSupport),
    ),
    nextActive,
  ];
  return { selection: { ...selection, assignments } };
}
