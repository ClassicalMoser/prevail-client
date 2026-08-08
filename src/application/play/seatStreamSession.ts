import { plainGameState } from '@application/gameState';
import { applyEvent } from '@classicalmoser/prevail-rules/domain';
import type {
  FailValidationResult,
  GameModeName,
  GameState,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type {
  GameSeat,
  GameSeatConnection,
  GameSeatConnectionStatus,
  GameSeatOutbound,
} from '@ports';
import {
  logSeatStreamInbound,
  logSeatStreamOutbound,
  logSeatStreamSnapshotRequest,
} from './logSeatStream';

export interface SeatGameSnapshot {
  id: string;
  gameMode: GameModeName;
  gameState: GameState;
}

export interface SeatStreamSessionCallbacks {
  onStatus: (status: GameSeatConnectionStatus) => void;
  onSnapshot: (game: SeatGameSnapshot) => void;
  onFoldedState: (change: {
    gameId: string;
    gameMode: GameModeName;
    gameState: GameState;
  }) => void;
  onRejected: (rejection: FailValidationResult) => void;
  /** Cleared when a snapshot lands or a fold fails open for resync. */
  onUnlockPending: () => void;
  /** Omit or pass `undefined` when the socket cannot send. */
  onSendReady: (send?: (choice: PlayerChoiceEvent) => boolean) => void;
}

export interface SeatStreamSessionDeps extends SeatStreamSessionCallbacks {
  gameId: string;
  side: PlayerSide;
  connect: GameSeat['connect'];
  getAccessToken: () => Promise<string | undefined>;
  readGameState: () => GameState | undefined;
  initialGameMode: GameModeName;
}

export interface SeatStreamSession {
  start: () => Promise<void>;
  dispose: () => void;
  sendChoice: (choice: PlayerChoiceEvent) => boolean;
}

/**
 * Non-Solid seat WebSocket session: connect, fold events, request snapshots.
 * One connection per instance; call {@link SeatStreamSession.dispose} to tear down.
 */
export function createSeatStreamSession(
  deps: SeatStreamSessionDeps,
): SeatStreamSession {
  let disposed = false;
  let connection: GameSeatConnection | undefined;
  let unsubStatus = (): void => {
    /* No-op until connected. */
  };
  let unsubMessages = (): void => {
    /* No-op until connected. */
  };
  let activeGameMode: GameModeName = deps.initialGameMode;

  const requestSnapshot = (): boolean => {
    if (connection === undefined) {
      return false;
    }
    logSeatStreamSnapshotRequest();
    return connection.requestGameSnapshot();
  };

  const handleMessage = (message: GameSeatOutbound): void => {
    if (disposed) {
      return;
    }
    switch (message.type) {
      case 'gameSnapshot': {
        const game = message.payload;
        logSeatStreamInbound(message);
        activeGameMode = game.gameMode;
        deps.onSnapshot({
          id: game.id,
          gameMode: game.gameMode,
          gameState: game.gameState as GameState,
        });
        deps.onUnlockPending();
        break;
      }
      case 'playerChoice':
      case 'gameEffect': {
        const current = deps.readGameState();
        if (current === undefined) {
          logSeatStreamInbound(message, {
            before: undefined,
            error: 'no local state yet',
          });
          console.error('Seat stream fold: no local state yet');
          requestSnapshot();
          return;
        }
        try {
          // Rules must see a plain tree — store proxies break apply/fold.
          const next = applyEvent(message.payload, plainGameState(current));
          logSeatStreamInbound(message, {
            before: current,
            after: next,
          });
          deps.onFoldedState({
            gameId: deps.gameId,
            gameMode: activeGameMode,
            gameState: next,
          });
        } catch (error) {
          logSeatStreamInbound(message, {
            before: current,
            error,
          });
          console.error('Seat stream fold failed', error, message.payload);
          deps.onUnlockPending();
          // Visibility-limited applies cannot fold onto seat state — resync.
          const requested = requestSnapshot();
          if (!requested) {
            deps.onRejected({
              errorReason:
                'Failed to apply server event locally. Your draft was kept — undo or retry, or refresh if the board looks wrong.',
              result: false,
            });
          }
        }
        break;
      }
      case 'choiceRejected': {
        logSeatStreamInbound(message);
        deps.onUnlockPending();
        deps.onRejected(message.payload);
        break;
      }
      default: {
        logSeatStreamInbound(message);
        break;
      }
    }
  };

  const dispose = (): void => {
    disposed = true;
    unsubStatus();
    unsubMessages();
    unsubStatus = () => {
      /* Cleared. */
    };
    unsubMessages = () => {
      /* Cleared. */
    };
    connection?.close();
    connection = undefined;
    deps.onSendReady();
  };

  const start = async (): Promise<void> => {
    deps.onStatus('connecting');
    deps.onSendReady();
    try {
      const connected = await deps.connect({
        gameId: deps.gameId,
        side: deps.side,
        getAccessToken: deps.getAccessToken,
      });
      if (disposed) {
        connected.close();
        return;
      }
      connection = connected;
      deps.onSendReady((choice) => {
        logSeatStreamOutbound(choice);
        return connected.sendChoice(choice);
      });
      unsubStatus = connected.subscribeStatus((status) => {
        if (!disposed) {
          deps.onStatus(status);
        }
      });
      unsubMessages = connected.subscribe(handleMessage);
      // Reconcile after subscribe — do not rely on the open-time push alone.
      requestSnapshot();
    } catch (error) {
      console.error(error);
      if (!disposed) {
        deps.onStatus('error');
      }
    }
  };

  return {
    start,
    dispose,
    sendChoice: (choice) => {
      if (connection === undefined) {
        return false;
      }
      logSeatStreamOutbound(choice);
      return connection.sendChoice(choice);
    },
  };
}
