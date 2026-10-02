import type { Command } from '@classicalmoser/prevail-rules/domain';
import type { SeatSelection } from '../selection';

function restrictionHint(command: Command): string {
  const { restrictions } = command;
  const parts: string[] = [];
  if (restrictions.traitRestrictions.length > 0) {
    parts.push(`traits: ${restrictions.traitRestrictions.join(', ')}`);
  }
  if (restrictions.unitRestrictions.length > 0) {
    const count = restrictions.unitRestrictions.length;
    const types = count === 1 ? 'unit type' : 'unit types';
    parts.push(`${count} named ${types}`);
  }
  if (restrictions.inspirationRangeRestriction >= 0) {
    parts.push(
      `within inspiration ${restrictions.inspirationRangeRestriction}`,
    );
  }
  if (command.size === 'units') {
    parts.push(`up to ${command.number}`);
  }
  if (parts.length === 0) {
    return 'no restrictions';
  }
  const joined = parts.join(' · ');
  return joined;
}

/**
 * Progress copy for issue, move, and ranged drafts.
 * Undefined for selections that do not use the board-progress line.
 */
function boardProgressHint(selection: SeatSelection): string | undefined {
  if (selection.kind === 'issueCommand' && selection.command !== undefined) {
    if (selection.legalUnitCoordinates.length === 0) {
      const restrictions = restrictionHint(selection.command);
      const hint = `No eligible units (${restrictions})`;
      return hint;
    }
    if (selection.command.size === 'units') {
      const hint = `${selection.selected.length} / up to ${selection.command.number} units`;
      return hint;
    }
    if (selection.lineStart === undefined) {
      return 'Click a unit to start the line';
    }
    if (selection.selected.length === 0) {
      return 'Click an end (same unit = single)';
    }
    const hint = `Line: ${selection.selected.length} unit(s)`;
    return hint;
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
    if (selection.supporters.length > 0) {
      const hint = `Target locked · ${selection.supporters.length} supporter(s) — Confirm`;
      return hint;
    }
    return 'Target locked · optional supporters, then Confirm';
  }
  return undefined;
}

export { boardProgressHint };
