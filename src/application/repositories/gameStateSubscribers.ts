import type { GameStateChange } from "@classicalmoser/prevail-rules/application";
import type { GameState, GameModeName } from "@classicalmoser/prevail-rules/domain";
import type { GameStateSubscriber } from "@domain";
import type { Accessor } from "solid-js";
import { createSignal } from "solid-js";

export interface GameStateSubscriberBundle {
  /** One UI subscriber; compose into `EnginePorts.gameStateSubscribers` with other listeners at the runner. */
  gameStateSubscriber: GameStateSubscriber;
  /**
   * Which game the UI follows;
   * must match {@link GameStateSubscriber.gameId} / {@link GameStateSubscriber.gameMode} when the engine notifies.
   * @param gameId - The ID of the game to subscribe to.
   * @param gameMode - The mode of the game to subscribe to.
   */
  setSubscribedGame: (gameId: string, gameMode: GameModeName) => void;
  subscribedGameState: Accessor<GameState | undefined>;
}

/**
 * Stateful UI bridge: Solid signals reflect engine-driven state for one subscriber.
 */
export const useGameStateSubscribers = (): GameStateSubscriberBundle => {
  const [subscribedGameId, setSubscribedGameId] = createSignal("");
  const [subscribedGameMode, setSubscribedGameMode] = createSignal<GameModeName>("mini");
  const [subscribedGameState, setSubscribedGameState] = createSignal<GameState | undefined>();

  const setSubscribedGame = (gameId: string, gameMode: GameModeName) => {
    const prevId = subscribedGameId();
    const prevType = subscribedGameMode();
    setSubscribedGameId(gameId);
    setSubscribedGameMode(gameMode);
    if (prevId !== gameId || prevType !== gameMode) {
      setSubscribedGameState(undefined);
    }
  };

  const gameStateSubscriber: GameStateSubscriber = {
    gameId: subscribedGameId(),
    gameMode: subscribedGameMode(),
    onGameStateChange: (change: GameStateChange) => {
      const { gameId, gameMode, gameState } = change;
      if (gameId !== subscribedGameId() || gameMode !== subscribedGameMode()) {
        return;
      }
      setSubscribedGameState(() => gameState);
    },
    onError: (error: Error) => {
      console.error(error);
    },
  };

  return {
    gameStateSubscriber,
    setSubscribedGame,
    subscribedGameState,
  };
};
