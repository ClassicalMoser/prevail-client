import type { Command } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '@application';

function restrictionHint(command: Command): string {
  const { restrictions } = command;
  const parts: string[] = [];
  if (restrictions.traitRestrictions.length > 0) {
    parts.push(`traits: ${restrictions.traitRestrictions.join(', ')}`);
  }
  if (restrictions.unitRestrictions.length > 0) {
    parts.push(`unit types: ${restrictions.unitRestrictions.length} id(s)`);
  }
  if (restrictions.inspirationRangeRestriction >= 0) {
    parts.push(
      `within inspiration ${restrictions.inspirationRangeRestriction}`,
    );
  }
  if (command.size === 'units') {
    parts.push(`up to ${command.number}`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'no restrictions';
}

/** Progress copy for issue / move / ranged board drafts. */
export function boardProgressHint(selection: SeatSelection): string | null {
  if (selection.kind === 'issueCommand' && selection.command !== undefined) {
    if (selection.legalUnitCoordinates.length === 0) {
      return `No eligible units (${restrictionHint(selection.command)})`;
    }
    if (selection.command.size === 'units') {
      return `${selection.selected.length} / up to ${selection.command.number} units`;
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
