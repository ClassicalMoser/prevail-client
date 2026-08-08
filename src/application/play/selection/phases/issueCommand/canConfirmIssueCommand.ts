import type { SeatSelection } from '@application/play/selection/core/types';

/**
 * Confirm when the draft spends 1..`command.number` units (number is a cap),
 * or a non-empty line for `size: 'lines'`.
 */
export function canConfirmIssueCommand(selection: SeatSelection): boolean {
  if (selection.kind !== 'issueCommand' || selection.command === undefined) {
    return false;
  }
  if (selection.command.size === 'units') {
    const count = selection.selected.length;
    return count >= 1 && count <= selection.command.number;
  }
  return selection.selected.length > 0 && selection.lineStart !== undefined;
}
