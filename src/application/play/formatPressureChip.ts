import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import { playerSideLabel } from '@application/gameState';

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

export { formatPressureChip };
