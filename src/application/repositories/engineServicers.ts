import type { GameStateSubscriber } from "@domain";
import { useEventStreamStorage } from "./eventStreamStorage";
import { useGameStateSubscribers } from "./gameStateSubscribers";
import { useGameStorage } from "./gameStorage";
import { useRoundSnapshotStorage } from "./roundSnapshotStorage";

export const useEngineServices = () => {
  const gameStorage = useGameStorage();
  const eventStreamStorage = useEventStreamStorage();
  const roundSnapshotStorage = useRoundSnapshotStorage();
  const { gameStateSubscriber, setSubscribedGame, subscribedGameState } =
    useGameStateSubscribers();
  /** Runner-scoped list; same reference for `createGameRunner` — push/splice to add or remove listeners. */
  const gameStateSubscribers: GameStateSubscriber[] = [];
  gameStateSubscribers.push(gameStateSubscriber);
  return {
    gameStorage,
    eventStreamStorage,
    roundSnapshotStorage,
    gameStateSubscribers,
    setSubscribedGame,
    subscribedGameState,
  };
};
