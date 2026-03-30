import type { EnginePorts, GameStateSubscriber } from "@domain";
import type { GameStateSubscriberBundle } from "./gameStateSubscribers";
import { useEventStreamStorage } from "./eventStreamStorage";
import { useGameStateSubscribers } from "./gameStateSubscribers";
import { useGameStorage } from "./gameStorage";
import { useRoundSnapshotStorage } from "./roundSnapshotStorage";

export interface EngineServicesBundle {
  ports: EnginePorts;
  /** UI bridge: same subscriber instance pushed onto `ports.gameStateSubscribers`. */
  subscriberUi: GameStateSubscriberBundle;
}

export const useEngineServices = (): EngineServicesBundle => {
  const gameStorage = useGameStorage();
  const eventStreamStorage = useEventStreamStorage();
  const roundSnapshotStorage = useRoundSnapshotStorage();
  const subscriberUi = useGameStateSubscribers();
  /** Runner-scoped list; same reference for `createGameRunner` — push/splice to add or remove listeners. */
  const gameStateSubscribers: GameStateSubscriber[] = [];
  gameStateSubscribers.push(subscriberUi.gameStateSubscriber);
  const ports: EnginePorts = {
    gameStorage,
    eventStreamStorage,
    roundSnapshotStorage,
    gameStateSubscribers,
  };
  return { ports, subscriberUi };
};
