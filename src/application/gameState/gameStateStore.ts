import type { GameStateChange } from '@classicalmoser/prevail-rules/application';
import type {
  GameModeName,
  GameState,
} from '@classicalmoser/prevail-rules/domain';
import type { GameStateSubscriber } from '@domain';
import type { Accessor } from 'solid-js';
import { createMemo } from 'solid-js';
import { createStore, reconcile, unwrap } from 'solid-js/store';

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

  const engineSubscriber: GameStateSubscriber = {
    gameId: '',
    gameMode: 'mini',
    onGameStateChange: (_change: GameStateChange) => {
      /* Assigned below after ingest is defined. */
    },
    onError: (error: Error) => {
      console.error(error);
    },
  };

  const ingest = (change: GameStateIngest): void => {
    // Adopt subscription identity from seat snapshots (do not silently drop).
    if (change.gameId !== store.gameId || change.gameMode !== store.gameMode) {
      console.error('[gameState] ingest adopting subscription', {
        from: { gameId: store.gameId, gameMode: store.gameMode },
        to: { gameId: change.gameId, gameMode: change.gameMode },
      });
      setStore({ gameId: change.gameId, gameMode: change.gameMode });
      engineSubscriber.gameId = change.gameId;
      engineSubscriber.gameMode = change.gameMode;
    }
    setStore('gameState', reconcile(change.gameState, { key: null }));
  };

  engineSubscriber.onGameStateChange = (change: GameStateChange) => {
    ingest(change);
  };

  const clear = () => {
    setStore('gameState', undefined);
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

  /**
   * Read the store path directly — do not wrap in `createMemo`.
   * A memoized `store.gameState` keeps the same proxy identity across
   * `reconcile`, so dependents that only track that memo never see folds
   * (remaining commands, legal options, etc. stay stale).
   */
  const state: Accessor<GameState | undefined> = () => store.gameState;
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

/**
 * Deep plain clone for prevail-rules pure functions / applyEvent.
 * Store proxies break array membership / trait checks in rules code.
 */
export function plainGameState(state: GameState): GameState {
  return structuredClone(unwrap(state));
}
