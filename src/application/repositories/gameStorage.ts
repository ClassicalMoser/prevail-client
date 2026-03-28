import type {
  Board,
  Game,
  GameState,
  GameType,
} from "@classicalmoser/prevail-rules/domain";
import type { GameStorage, PortResponse } from "@domain";

export const useGameStorage = (): GameStorage => {
  const games = new Map<string, Game>();

  /**
   * Get a game from the storage.
   * @param gameId - The ID of the game to get.
   * @param gameType - The type of the game to get.
   * @returns The game if it exists and is of the correct type, otherwise an error.
   */
  const getGame = async (
    gameId: string,
    gameType: GameType,
  ): Promise<PortResponse<Game | undefined>> => {
    const foundGame = games.get(gameId);
    if (!foundGame) {
      return { result: false, errorReason: "Game not found" };
    }
    if (foundGame.gameType !== gameType) {
      return { result: false, errorReason: "Game type mismatch" };
    }
    return { result: true, data: foundGame };
  };

  /**
   * Save a new game to the storage.
   * @param game - The game to save.
   * @returns The result of the operation.
   */
  const saveNewGame = async (game: Game): Promise<PortResponse<void>> => {
    if (games.has(game.id)) {
      return { result: false, errorReason: "Game already exists" };
    }
    games.set(game.id, game);
    return { result: true, data: undefined };
  };

  /**
   * Update the state of a game in the storage.
   * @param gameId - The ID of the game to update.
   * @param gameState - The new state of the game.
   * @returns The result of the operation.
   */
  const updateGameState = async (
    gameId: string,
    gameState: GameState<Board>,
  ): Promise<PortResponse<void>> => {
    const existing = games.get(gameId);
    if (!existing) {
      return { result: false, errorReason: "Game not found" };
    }
    games.set(gameId, { ...existing, gameState } as Game);
    return { result: true, data: undefined };
  };

  return {
    getGame,
    saveNewGame,
    updateGameState,
  };
};
