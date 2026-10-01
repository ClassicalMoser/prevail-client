import type { GameState } from '@classicalmoser/prevail-rules/domain';
import type { PortResponse, RoundSnapshotStorage } from '@domain';
import { composeRoundKey } from './composeRoundKey';

/**
 * In-memory {@link RoundSnapshotStorage}, keyed by game and round.
 * A new map is allocated per call. Mount the result once with the engine.
 */
function createRoundSnapshotStorage(): RoundSnapshotStorage {
  const snapshots = new Map<string, GameState>();

  /**
   * Load the persisted end-of-round {@link GameState} for a round, if any.
   */
  const getRoundSnapshot = async (
    gameId: string,
    roundNumber: number,
  ): Promise<PortResponse<GameState | undefined>> => {
    const key = composeRoundKey(gameId, roundNumber);
    const stored = snapshots.get(key);
    if (stored === undefined) {
      const missing: PortResponse<GameState | undefined> = {
        result: true,
        data: undefined,
      };
      return missing;
    }
    const found: PortResponse<GameState | undefined> = {
      result: true,
      data: stored,
    };
    return found;
  };

  /**
   * Persist the game state at the end of a round.
   */
  const saveRoundSnapshot = async (
    gameId: string,
    roundNumber: number,
    gameState: GameState,
  ): Promise<PortResponse<void>> => {
    const key = composeRoundKey(gameId, roundNumber);
    snapshots.set(key, gameState);
    const saved: PortResponse<void> = { result: true, data: undefined };
    return saved;
  };

  const storage: RoundSnapshotStorage = {
    getRoundSnapshot,
    saveRoundSnapshot,
  };
  return storage;
}

export { createRoundSnapshotStorage };
