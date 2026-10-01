import type {
  CardStateForVisibility,
  Game,
  GameForVisibility,
  GameModeName,
  GameState,
  GameStateForVisibility,
  GameStateVisibility,
} from '@classicalmoser/prevail-rules/domain';
import type { GameStorage, PortResponse } from '@domain';

/**
 * Copy the shared game-state fields and attach one narrowed card state.
 * Spreading the wide {@link GameState} keeps the union, so the card state is set by name.
 */
function stateForVisibility<V extends GameStateVisibility>(
  gameState: GameState,
  cardState: CardStateForVisibility<V>,
): GameStateForVisibility<V> {
  const next: GameStateForVisibility<V> = {
    currentRoundNumber: gameState.currentRoundNumber,
    currentRoundState: gameState.currentRoundState,
    currentInitiative: gameState.currentInitiative,
    cardState,
    reservedUnits: gameState.reservedUnits,
    routedUnits: gameState.routedUnits,
    lostCommanders: gameState.lostCommanders,
    boardState: gameState.boardState,
  };
  if (gameState.winner !== undefined) {
    next.winner = gameState.winner;
  }
  return next;
}

/**
 * Replace `existing.gameState` when the next snapshot uses the same card visibility.
 * A mismatch returns undefined.
 */
function gameWithState(existing: Game, gameState: GameState): Game | undefined {
  const cardState = gameState.cardState;

  if (existing.gameState.cardState.visibility === 'authoritative') {
    if (cardState.visibility !== 'authoritative') {
      return undefined;
    }
    const state = stateForVisibility(gameState, cardState);
    const next: GameForVisibility<'authoritative'> = {
      ...existing,
      gameState: state,
    };
    return next;
  }

  if (existing.gameState.cardState.visibility === 'whiteSeen') {
    if (cardState.visibility !== 'whiteSeen') {
      return undefined;
    }
    const state = stateForVisibility(gameState, cardState);
    const next: GameForVisibility<'whiteSeen'> = {
      ...existing,
      gameState: state,
    };
    return next;
  }

  if (cardState.visibility !== 'blackSeen') {
    return undefined;
  }
  const state = stateForVisibility(gameState, cardState);
  const next: GameForVisibility<'blackSeen'> = {
    ...existing,
    gameState: state,
  };
  return next;
}

/**
 * In-memory {@link GameStorage}.
 * A new map is allocated per call. Mount the result once with the engine.
 */
function createGameStorage(): GameStorage {
  const games = new Map<string, Game>();

  /**
   * Get a game from the storage.
   * @param gameId - The ID of the game to get.
   * @param gameMode - The type of the game to get.
   * @returns The game if it exists and is of the correct type, otherwise an error.
   */
  const getGame = async (
    gameId: string,
    gameMode: GameModeName,
  ): Promise<PortResponse<Game>> => {
    const foundGame = games.get(gameId);
    if (foundGame === undefined) {
      const missing: PortResponse<Game> = {
        result: false,
        errorReason: 'Game not found',
      };
      return missing;
    }
    if (foundGame.gameMode !== gameMode) {
      const mismatch: PortResponse<Game> = {
        result: false,
        errorReason: 'Game type mismatch',
      };
      return mismatch;
    }
    const found: PortResponse<Game> = { result: true, data: foundGame };
    return found;
  };

  /**
   * Save a new game to the storage.
   * @param game - The game to save.
   * @returns The result of the operation.
   */
  const saveNewGame = async (game: Game): Promise<PortResponse<void>> => {
    if (games.has(game.id)) {
      const duplicate: PortResponse<void> = {
        result: false,
        errorReason: 'Game already exists',
      };
      return duplicate;
    }
    games.set(game.id, game);
    const saved: PortResponse<void> = { result: true, data: undefined };
    return saved;
  };

  /**
   * Update the state of a game in the storage.
   * @param gameId - The ID of the game to update.
   * @param gameState - The new state of the game.
   * @returns The result of the operation.
   */
  const updateGameState = async (
    gameId: string,
    gameState: GameState,
  ): Promise<PortResponse<void>> => {
    const existing = games.get(gameId);
    if (existing === undefined) {
      const missing: PortResponse<void> = {
        result: false,
        errorReason: 'Game not found',
      };
      return missing;
    }
    const next = gameWithState(existing, gameState);
    if (next === undefined) {
      const mismatch: PortResponse<void> = {
        result: false,
        errorReason: 'Game state visibility mismatch',
      };
      return mismatch;
    }
    games.set(gameId, next);
    const updated: PortResponse<void> = { result: true, data: undefined };
    return updated;
  };

  const storage: GameStorage = {
    getGame,
    saveNewGame,
    updateGameState,
  };
  return storage;
}

export { createGameStorage };
