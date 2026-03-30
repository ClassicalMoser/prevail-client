/** Map key for per-round data (event streams, round snapshots, etc.). */
export function composeRoundKey(gameId: string, roundNumber: number): string {
  return `${gameId}::${roundNumber}`;
}
