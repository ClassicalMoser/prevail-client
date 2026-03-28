/** Map key for per-round data (event streams, round snapshots, etc.). */
export function compositeRoundKey(gameId: string, roundNumber: number): string {
  return `${gameId}::${roundNumber}`;
}
