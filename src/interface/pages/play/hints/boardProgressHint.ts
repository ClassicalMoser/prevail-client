import type { SeatSelection } from '@application';

/** Progress copy for issue / move / ranged board drafts. */
export function boardProgressHint(selection: SeatSelection): string | null {
  if (selection.kind === 'issueCommand' && selection.command !== undefined) {
    if (selection.command.size === 'units') {
      return `${selection.selected.length} / ${selection.command.number} units`;
    }
    if (selection.lineStart === undefined) {
      return 'Click a unit to start the line';
    }
    if (selection.selected.length === 0) {
      return 'Click an end (same unit = single)';
    }
    return `Line: ${selection.selected.length} unit(s)`;
  }
  if (selection.kind === 'moveUnit') {
    if (selection.unit === undefined) {
      return 'Click a commanded unit to move';
    }
    if (selection.destinations.length === 0) {
      return 'No legal destinations for that unit — pick another';
    }
    return 'Click a highlighted destination';
  }
  if (selection.kind === 'performRangedAttack') {
    if (selection.attacker === undefined) {
      return 'Click a commanded unit to attack with';
    }
    if (selection.target === undefined) {
      return 'Click an enemy in range / front arc';
    }
    return selection.supporters.length > 0
      ? `Target locked · ${selection.supporters.length} supporter(s) — Confirm`
      : 'Target locked · optional supporters, then Confirm';
  }
  return null;
}
