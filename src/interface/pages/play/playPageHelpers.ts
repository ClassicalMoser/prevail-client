import type { PhaseSummary } from '@application';
import type {
  PlayerSide,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';

export function parseSide(raw: string): PlayerSide | undefined {
  if (raw === 'white' || raw === 'black') {
    return raw;
  }
  return undefined;
}

export function isSelectedSetupUnit(
  selected: UnitInstance | undefined,
  unit: UnitInstance,
): boolean {
  return (
    selected !== undefined &&
    selected.instanceNumber === unit.instanceNumber &&
    selected.unitType.id === unit.unitType.id
  );
}

export function formatPhase(summary: PhaseSummary | undefined): string {
  if (summary === undefined) {
    return '—';
  }
  if (summary.kind === 'none') {
    return 'pre-phase';
  }
  return `${summary.phase} / ${summary.step}`;
}
