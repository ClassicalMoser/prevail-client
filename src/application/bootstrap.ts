import type {
  Board,
  GameState,
  PlayerChoiceEvent,
  GameModeName,
} from '@classicalmoser/prevail-rules/domain';
import type { PortResponse } from '@domain';
import type { Accessor } from 'solid-js';
import { useEngine } from '@domain';
import { createMemo } from 'solid-js';
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
  subscribedGameState: Accessor<GameState | undefined>;
  subscribedBoard: Accessor<Board | undefined>;
}

export const createCore = (): Core => {
  const { ports, subscriberUi } = useEngineServices();
  const engine = useEngine(ports);

  const startNewGame = async (gameMode: GameModeName) => {
    subscriberUi.setSubscribedGame(TEMP_STUB_GAME_ID, gameMode);
    await engine.startNewGame(gameMode);
  };

  const subscribedBoard: Accessor<Board | undefined> = createMemo(
    () => subscriberUi.subscribedGameState()?.boardState,
  );

  return {
    startNewGame,
    handlePlayerChoiceSubmission: engine.handlePlayerChoiceSubmission,
    setSubscribedGame: subscriberUi.setSubscribedGame,
    subscribedGameState: subscriberUi.subscribedGameState,
    subscribedBoard,
  };
};
