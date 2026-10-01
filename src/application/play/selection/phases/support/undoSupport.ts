import type { SeatSelection } from '@application/play/selection/core/types';

export function undoSupport(
  selection: Extract<SeatSelection, { kind: 'assignUnitSupport' }>,
): SeatSelection {
  if (selection.assignments.some((assignment) => assignment.units.length > 0)) {
    const assignments = selection.assignments.map((assignment) => ({
      unitSupport: assignment.unitSupport,
      units: [...assignment.units],
    }));
    for (let i = assignments.length - 1; i >= 0; i -= 1) {
      const entry = assignments[i];
      if (entry !== undefined && entry.units.length > 0) {
        entry.units = entry.units.slice(0, -1);
        break;
      }
    }
    return {
      ...selection,
      assignments: assignments.filter(
        (assignment) => assignment.units.length > 0,
      ),
    };
  }
  return {
    kind: 'assignUnitSupport',
    activeSupport: undefined,
    assignments: [],
  };
}
