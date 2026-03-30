import type { Board, GameState } from "@classicalmoser/prevail-rules/domain";
import type { PortResponse, RoundSnapshotStorage } from "@domain";
import { composeRoundKey } from "./composeRoundKey";

export const useRoundSnapshotStorage = (): RoundSnapshotStorage => {
  const snapshots = new Map<string, GameState<Board>>();

  /**
   * Load the persisted end-of-round {@link GameState} for a round, if any.
   */
  const getRoundSnapshot = async <TBoard extends Board>(
    gameId: string,
    roundNumber: number,
  ): Promise<PortResponse<GameState<TBoard> | undefined>> => {
    const key = composeRoundKey(gameId, roundNumber);
    const stored = snapshots.get(key);
    if (stored === undefined) {
      return { result: true, data: undefined };
    }
    return { result: true, data: stored as GameState<TBoard> };
  };

  /**
   * Persist the game state at the end of a round.
   */
  const saveRoundSnapshot = async <TBoard extends Board>(
    gameId: string,
    roundNumber: number,
    gameState: GameState<TBoard>,
  ): Promise<PortResponse<void>> => {
    const key = composeRoundKey(gameId, roundNumber);
    snapshots.set(key, gameState);
    return { result: true, data: undefined };
  };

  return {
    getRoundSnapshot,
    saveRoundSnapshot,
  };
};
