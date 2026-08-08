import type {
  GameModeName,
  PlayerChoiceEvent,
} from '@classicalmoser/prevail-rules/domain';
import type { GameStateChange, PortResponse } from '@domain';
import { useEngine } from '@domain';
import type { GameStateProjections } from './gameState';
import { createGameStateProjections } from './gameState';
import { useEngineServices } from './repositories';

/**
 * Must match the game id used when creating a game (see prevail-rules `startNewGame`).
 * Subscriber is set before `startNewGame` so the first persisted state push matches
 * `gameId` / `gameMode` in {@link EnginePorts.gameStateSubscribers}.
 */
const TEMP_STUB_GAME_ID = '00000000-0000-0000-0000-000000000000';

export interface Core {
  startNewGame: (gameMode: GameModeName) => Promise<void>;
  handlePlayerChoiceSubmission: (
    gameId: string,
    gameMode: GameModeName,
    playerChoice: PlayerChoiceEvent,
  ) => Promise<PortResponse<void>>;
  setSubscribedGame: (gameId: string, gameMode: GameModeName) => void;
  /** Sole client write path for authoritative snapshots (engine today; future WS later). */
  ingestGameState: (change: GameStateChange) => void;
  /** Reactive projections of the subscribed game. */
  game: GameStateProjections;
}

export const createCore = (): Core => {
  const { ports, gameStateStore } = useEngineServices();
  const engine = useEngine(ports);
  const game = createGameStateProjections(gameStateStore);

  const startNewGame = async (gameMode: GameModeName) => {
    gameStateStore.setSubscribedGame(TEMP_STUB_GAME_ID, gameMode);
    await engine.startNewGame(gameMode);
  };

  return {
    startNewGame,
    handlePlayerChoiceSubmission: engine.handlePlayerChoiceSubmission,
    setSubscribedGame: gameStateStore.setSubscribedGame,
    ingestGameState: gameStateStore.ingest,
    game,
  };
};
