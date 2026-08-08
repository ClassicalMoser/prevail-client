import type { GameStateChange } from '@classicalmoser/prevail-rules/application';
import type {
  GameModeName,
  GameState,
} from '@classicalmoser/prevail-rules/domain';
import type { GameStateSubscriber } from '@domain';
import type { Accessor } from 'solid-js';
import { createMemo } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

export interface GameStateIngest {
  gameId: string;
  gameMode: GameModeName;
  gameState: GameState;
}

export interface GameStateStore {
  /** Which game the UI follows; also keeps {@link engineSubscriber} identity in sync for runner filtering. */
  setSubscribedGame: (gameId: string, gameMode: GameModeName) => void;
  /** Sole write path for authoritative snapshots (local engine today; future WS later). */
  ingest: (change: GameStateIngest) => void;
  clear: () => void;
  state: Accessor<GameState | undefined>;
  gameId: Accessor<string>;
  gameMode: Accessor<GameModeName>;
  /**
   * Engine port listener. `gameId` / `gameMode` fields are mutated by {@link setSubscribedGame}
   * so `startNewGame` identity checks see current subscription.
   */
  engineSubscriber: GameStateSubscriber;
}

interface StoreShape {
  gameId: string;
  gameMode: GameModeName;
  gameState: GameState | undefined;
}

/**
 * Authoritative GameState holder with a single ingest seam.
 * Local engine and a future transport both call {@link GameStateStore.ingest}.
 */
export const createGameStateStore = (): GameStateStore => {
  const [store, setStore] = createStore<StoreShape>({
    gameId: '',
    gameMode: 'mini',
    gameState: undefined,
  });

  const ingest = (change: GameStateIngest) => {
    if (change.gameId !== store.gameId || change.gameMode !== store.gameMode) {
      return;
    }
    setStore('gameState', reconcile(change.gameState));
  };

  const clear = () => {
    setStore('gameState', undefined);
  };

  const engineSubscriber: GameStateSubscriber = {
    gameId: '',
    gameMode: 'mini',
    onGameStateChange: (change: GameStateChange) => {
      ingest(change);
    },
    onError: (error: Error) => {
      console.error(error);
    },
  };

  const setSubscribedGame = (gameId: string, gameMode: GameModeName) => {
    const identityChanged =
      store.gameId !== gameId || store.gameMode !== gameMode;
    setStore({ gameId, gameMode });
    engineSubscriber.gameId = gameId;
    engineSubscriber.gameMode = gameMode;
    if (identityChanged) {
      setStore('gameState', undefined);
    }
  };

  const state: Accessor<GameState | undefined> = createMemo(
    () => store.gameState,
  );
  const gameId: Accessor<string> = createMemo(() => store.gameId);
  const gameMode: Accessor<GameModeName> = createMemo(() => store.gameMode);

  return {
    setSubscribedGame,
    ingest,
    clear,
    state,
    gameId,
    gameMode,
    engineSubscriber,
  };
};
