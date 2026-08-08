import type { SeatSelection } from '@application/play/selection/core/types';

export function canConfirmIssueCommand(selection: SeatSelection): boolean {
  if (selection.kind !== 'issueCommand' || selection.command === undefined) {
    return false;
  }
  if (selection.command.size === 'units') {
    return selection.selected.length === selection.command.number;
  }
  return selection.selected.length > 0 && selection.lineStart !== undefined;
}
