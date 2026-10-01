import type { GameStateChange } from '@classicalmoser/prevail-rules/application';
import type {
  GameModeName,
  GameState,
} from '@classicalmoser/prevail-rules/domain';
import type { GameStateSubscriber } from '@domain';
import { createMemo } from 'solid-js';
import type { Accessor } from 'solid-js';
import { createStore, reconcile, unwrap } from 'solid-js/store';

interface GameStateIngest {
  gameId: string;
  gameMode: GameModeName;
  gameState: GameState;
}

interface GameStateStore {
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

/**
 * Reconcile a snapshot without treating an `id` field as row identity.
 * Solid defaults `key` to `"id"`. Passing undefined is the same as omitting
 * it, so the default still applies. Null is the switch that turns keying off.
 * GameState rows are not identified that way.
 */
function reconcileStoredGameState(
  next: GameState,
): (state: GameState | undefined) => GameState {
  return reconcile(next, {
    // oxlint-disable-next-line unicorn/no-null -- ReconcileOptions.key is string | null
    key: null,
  });
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
const createGameStateStore = (): GameStateStore => {
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
    setStore('gameState', reconcileStoredGameState(change.gameState));
  };

  // Engine callback, not a Solid tracked scope — ingest closes over the store.
  // eslint-disable-next-line solid/reactivity -- external subscriber wire-up
  engineSubscriber.onGameStateChange = (change: GameStateChange): void => {
    ingest(change);
  };

  const clear = (): void => {
    setStore('gameState', undefined);
  };

  const setSubscribedGame = (gameId: string, gameMode: GameModeName): void => {
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
function plainGameState(state: GameState): GameState {
  return structuredClone(unwrap(state));
}

export {
  type GameStateIngest,
  type GameStateStore,
  createGameStateStore,
  plainGameState,
};
