import { createGameStateStore } from '@application/gameState';
import type { GameStateStore } from '@application/gameState';
import type { EnginePorts, GameStateSubscriber } from '@domain';
import { createEventStreamStorage } from './eventStreamStorage';
import { createGameStorage } from './gameStorage';
import { createRoundSnapshotStorage } from './roundSnapshotStorage';

interface EngineServicesBundle {
  ports: EnginePorts;
  /** Authoritative GameState store; engine subscriber is one ingest producer. */
  gameStateStore: GameStateStore;
}

/**
 * Allocate the in-memory engine ports and the game-state store.
 * Call once, from `createCore`. Each call builds a new map set.
 */
function createEngineServices(): EngineServicesBundle {
  const gameStorage = createGameStorage();
  const eventStreamStorage = createEventStreamStorage();
  const roundSnapshotStorage = createRoundSnapshotStorage();
  const gameStateStore = createGameStateStore();
  /**
   * Runner-scoped list. The same reference is handed to `createGameRunner`.
   * Push or splice to add or remove listeners.
   */
  const gameStateSubscribers: GameStateSubscriber[] = [];
  gameStateSubscribers.push(gameStateStore.engineSubscriber);
  const ports: EnginePorts = {
    gameStorage,
    eventStreamStorage,
    roundSnapshotStorage,
    gameStateSubscribers,
  };
  const bundle: EngineServicesBundle = { ports, gameStateStore };
  return bundle;
}

export { type EngineServicesBundle, createEngineServices };
