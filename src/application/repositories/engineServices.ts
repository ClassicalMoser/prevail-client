import { createGameStateStore } from '@application/gameState';
import type { GameStateStore } from '@application/gameState';
import type { EnginePorts, GameStateSubscriber } from '@domain';
import { useEventStreamStorage } from './eventStreamStorage';
import { useGameStorage } from './gameStorage';
import { useRoundSnapshotStorage } from './roundSnapshotStorage';

interface EngineServicesBundle {
  ports: EnginePorts;
  /** Authoritative GameState store; engine subscriber is one ingest producer. */
  gameStateStore: GameStateStore;
}

const useEngineServices = (): EngineServicesBundle => {
  const gameStorage = useGameStorage();
  const eventStreamStorage = useEventStreamStorage();
  const roundSnapshotStorage = useRoundSnapshotStorage();
  const gameStateStore = createGameStateStore();
  /** Runner-scoped list; same reference for `createGameRunner` — push/splice to add or remove listeners. */
  const gameStateSubscribers: GameStateSubscriber[] = [];
  gameStateSubscribers.push(gameStateStore.engineSubscriber);
  const ports: EnginePorts = {
    gameStorage,
    eventStreamStorage,
    roundSnapshotStorage,
    gameStateSubscribers,
  };
  return { ports, gameStateStore };
};

export { type EngineServicesBundle, useEngineServices };
