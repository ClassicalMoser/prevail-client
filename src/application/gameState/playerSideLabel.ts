import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';

/** Player-facing side name. The enum key stays in the rules types. */
function playerSideLabel(side: PlayerSide): string {
  if (side === 'white') {
    const label = 'White';
    return label;
  }
  const label = 'Black';
  return label;
}

export { playerSideLabel };
