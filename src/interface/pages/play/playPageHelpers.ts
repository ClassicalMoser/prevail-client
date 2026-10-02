import { playerSideLabel } from '@application';
import type { PlayerSide, UnitInstance } from '@classicalmoser/prevail-rules/domain';

function parseSide(raw: string): PlayerSide | undefined {
  if (raw === 'white' || raw === 'black') {
    return raw;
  }
  return undefined;
}

function isSelectedSetupUnit(
  selected: UnitInstance | undefined,
  unit: UnitInstance,
): boolean {
  return (
    selected !== undefined &&
    selected.instanceNumber === unit.instanceNumber &&
    selected.unitType.id === unit.unitType.id
  );
}

function formatPressureChip(args: {
  routedCount: number;
  lostCommanders: readonly PlayerSide[];
}): string | undefined {
  const parts: string[] = [];
  if (args.routedCount > 0) {
    const routed = `${args.routedCount} routed`;
    parts.push(routed);
  }
  if (args.lostCommanders.length > 0) {
    const names = args.lostCommanders.map((side) => playerSideLabel(side));
    const lost = `commanders lost: ${names.join(', ')}`;
    parts.push(lost);
  }
  if (parts.length === 0) {
    return;
  }
  const chip = parts.join(' · ');
  return chip;
}

export { parseSide, isSelectedSetupUnit, formatPressureChip };
