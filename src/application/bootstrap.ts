import type { GameType } from "@classicalmoser/prevail-rules/domain";
import { useEngine } from "@domain";
import { useEngineServices } from "./repositories";

/**
 * Must match the game id used when creating a game (see prevail-rules `startNewGame`).
 * Subscriber is set before `startNewGame` so the first persisted state push matches
 * `gameId` / `gameType` in {@link EnginePorts.gameStateSubscribers}.
 */
const TEMP_STUB_GAME_ID = "00000000-0000-0000-0000-000000000000";

export const useCore = () => {
  const engineServices = useEngineServices();
  const engine = useEngine(engineServices);

  const startNewGame = async (gameType: GameType) => {
    engineServices.setSubscribedGame(TEMP_STUB_GAME_ID, gameType);
    await engine.startNewGame(gameType);
  };

  return {
    startNewGame,
    handlePlayerChoiceSubmission: engine.handlePlayerChoiceSubmission,
    setSubscribedGame: engineServices.setSubscribedGame,
    subscribedGameState: engineServices.subscribedGameState,
  };
};
