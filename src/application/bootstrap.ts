import type {
  Board,
  BoardForGameType,
  GameState,
  GameType,
  PlayerChoiceEvent,
  PlayerChoiceType,
} from "@classicalmoser/prevail-rules/domain";
import type { PortResponse } from "@domain";
import type { Accessor } from "solid-js";
import { useEngine } from "@domain";
import { createMemo } from "solid-js";
import { useEngineServices } from "./repositories";

/**
 * Must match the game id used when creating a game (see prevail-rules `startNewGame`).
 * Subscriber is set before `startNewGame` so the first persisted state push matches
 * `gameId` / `gameType` in {@link EnginePorts.gameStateSubscribers}.
 */
const TEMP_STUB_GAME_ID = "00000000-0000-0000-0000-000000000000";

export interface Core {
  startNewGame: (gameType: GameType) => Promise<void>;
  handlePlayerChoiceSubmission: (
    gameId: string,
    gameType: GameType,
    playerChoice: PlayerChoiceEvent<Board, PlayerChoiceType>,
  ) => Promise<PortResponse<void>>;
  setSubscribedGame: (gameId: string, gameType: GameType) => void;
  subscribedGameState: Accessor<
    GameState<BoardForGameType[GameType]> | undefined
  >;
  subscribedBoard: Accessor<Board | undefined>;
}

export const createCore = (): Core => {
  const { ports, subscriberUi } = useEngineServices();
  const engine = useEngine(ports);

  const startNewGame = async (gameType: GameType) => {
    subscriberUi.setSubscribedGame(TEMP_STUB_GAME_ID, gameType);
    await engine.startNewGame(gameType);
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
