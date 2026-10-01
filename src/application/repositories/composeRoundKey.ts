/** Map key for per-round data (event streams, round snapshots, etc.). */
function composeRoundKey(gameId: string, roundNumber: number): string {
  const key = `${gameId}::${roundNumber}`;
  return key;
}

export { composeRoundKey };
