import type { SeatSelection } from '@application/play/selection/core/types';

export function canConfirmPerformRangedAttack(
  selection: SeatSelection,
): boolean {
  return (
    selection.kind === 'performRangedAttack' &&
    selection.attacker !== undefined &&
    selection.target !== undefined
  );
}
