import { playerSideLabel } from '@application/gameState';
import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';

/** Seat-relative commitment side line for the melee rail. */
function seatCommitmentSideLabel(
  humanSide: PlayerSide,
  whose: 'you' | 'opponent',
): string {
  if (whose === 'you') {
    const label = `You (${playerSideLabel(humanSide)})`;
    return label;
  }
  const opp = humanSide === 'white' ? 'black' : 'white';
  const label = `Opponent (${playerSideLabel(opp)})`;
  return label;
}

export { seatCommitmentSideLabel };
