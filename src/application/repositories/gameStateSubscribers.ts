import type { GameStateChange } from "@classicalmoser/prevail-rules/application";
import type {
  BoardForGameType,
  GameState,
  GameType,
} from "@classicalmoser/prevail-rules/domain";
import type { GameStateSubscriber } from "@domain";
import type { Accessor } from "solid-js";
import { createSignal } from "solid-js";

export interface GameStateSubscriberBundle {
  /** One UI subscriber; compose into `EnginePorts.gameStateSubscribers` with other listeners at the runner. */
  gameStateSubscriber: GameStateSubscriber;
  /**
   * Which game the UI follows;
   * must match {@link GameStateSubscriber.gameId} / {@link GameStateSubscriber.gameType} when the engine notifies.
   * @param gameId - The ID of the game to subscribe to.
   * @param gameType - The type of the game to subscribe to.
   */
  setSubscribedGame: (gameId: string, gameType: GameType) => void;
  subscribedGameState: Accessor<
    GameState<BoardForGameType[GameType]> | undefined
  >;
}

/**
 * Stateful UI bridge: Solid signals reflect engine-driven state for one subscriber.
 */
export const useGameStateSubscribers = (): GameStateSubscriberBundle => {
  const [subscribedGameId, setSubscribedGameId] = createSignal("");
  const [subscribedGameType, setSubscribedGameType] =
    createSignal<GameType>("standard");
  const [subscribedGameState, setSubscribedGameState] = createSignal<
    GameState<BoardForGameType[GameType]> | undefined
  >(undefined);

  const setSubscribedGame = (gameId: string, gameType: GameType) => {
    setSubscribedGameId(gameId);
    setSubscribedGameType(gameType);
    setSubscribedGameState(undefined);
  };

  const gameStateSubscriber: GameStateSubscriber = {
    get gameId() {
      return subscribedGameId();
    },
    get gameType() {
      return subscribedGameType();
    },
    onGameStateChange: (change: GameStateChange) => {
      const { gameId, gameType, gameState } = change;
      if (gameId !== subscribedGameId() || gameType !== subscribedGameType()) {
        return;
      }
      setSubscribedGameState(
        () => gameState as GameState<BoardForGameType[GameType]>,
      );
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
