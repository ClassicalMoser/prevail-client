import { createEmptyGameState } from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import { createRoundSnapshotStorage } from './roundSnapshotStorage';

describe('in-memory round snapshot storage', () => {
  it('reports no data when the round has no snapshot', async () => {
    expect.hasAssertions();
    const storage = createRoundSnapshotStorage();
    const response = await storage.getRoundSnapshot('game-1', 1);

    expect(response).toStrictEqual({ result: true, data: undefined });
  }, 1000);

  it('returns the snapshot that was saved for that round', async () => {
    expect.hasAssertions();
    const storage = createRoundSnapshotStorage();
    const gameState = createEmptyGameState('standard');
    await storage.saveRoundSnapshot('game-1', 2, gameState);
    const response = await storage.getRoundSnapshot('game-1', 2);

    expect(response).toStrictEqual({ result: true, data: gameState });
  }, 1000);
});
