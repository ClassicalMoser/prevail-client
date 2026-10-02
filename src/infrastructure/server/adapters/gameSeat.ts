import type {
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
  contractForSide,
  parseGameSeatOutbound,
} from './parseGameSeatOutbound';

const seatPath = (side: PlayerSide, gameId: string): string => {
  const contract = contractForSide(side);
  const path = contract.path.replace(':gameId', encodeURIComponent(gameId));
  return path;
};

const waitForWebSocketOpen = (
  socket: WebSocket,
  setStatus: (next: GameSeatConnectionStatus) => void,
): Promise<void> => {
  if (socket.readyState === WebSocket.OPEN) {
    setStatus('open');
    return Promise.resolve();
  }
  if (
    socket.readyState === WebSocket.CLOSING ||
    socket.readyState === WebSocket.CLOSED
  ) {
    setStatus('closed');
    return Promise.reject(new Error('Seat WebSocket closed before open.'));
  }

  // WebSocket open is event-driven; a one-shot Promise is the standard bridge.
  // eslint-disable-next-line promise/avoid-new -- no async WebSocket open API
  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const handlers = {
      onOpen(): void {
        if (settled) {
          return;
        }
        settled = true;
        socket.removeEventListener('open', handlers.onOpen);
        socket.removeEventListener('error', handlers.onError);
        socket.removeEventListener('close', handlers.onClose);
        setStatus('open');
        resolve();
      },
      onError(): void {
        if (settled) {
          return;
        }
        settled = true;
        socket.removeEventListener('open', handlers.onOpen);
        socket.removeEventListener('error', handlers.onError);
        socket.removeEventListener('close', handlers.onClose);
        setStatus('error');
        reject(new Error('Seat WebSocket failed to open.'));
      },
      onClose(): void {
        if (settled) {
          return;
        }
        settled = true;
        socket.removeEventListener('open', handlers.onOpen);
        socket.removeEventListener('error', handlers.onError);
        socket.removeEventListener('close', handlers.onClose);
        setStatus('closed');
        reject(new Error('Seat WebSocket closed before open.'));
      },
    };
    socket.addEventListener('open', handlers.onOpen);
    socket.addEventListener('error', handlers.onError);
    socket.addEventListener('close', handlers.onClose);
  });
};

/**
 * Browser WebSocket seat client.
 * Auth uses `access_token` query (browsers cannot set Authorization on upgrade).
 */
export function createGameSeatAdapter(wsBaseUrl: string): GameSeat {
  const base = wsBaseUrl.replace(/\/$/u, '');

  return {
    async connect({ gameId, side, getAccessToken }) {
      const token = await getAccessToken();
      if (token === undefined || token === '') {
        throw new Error('Missing access token for seat WebSocket.');
      }

      const url = `${base}${seatPath(side, gameId)}?access_token=${encodeURIComponent(token)}`;

      const listeners = new Set<(message: GameSeatOutbound) => void>();
      const statusListeners = new Set<
        (status: GameSeatConnectionStatus) => void
      >();
      /** Server may push a snapshot on open before the app has subscribed. */
      const pendingMessages: GameSeatOutbound[] = [];
      let status: GameSeatConnectionStatus = 'connecting';

      const setStatus = (next: GameSeatConnectionStatus): void => {
        status = next;
        for (const listener of statusListeners) {
          listener(next);
        }
      };

      const dispatch = (message: GameSeatOutbound): void => {
        if (listeners.size === 0) {
          pendingMessages.push(message);
          return;
        }
        for (const listener of listeners) {
          listener(message);
        }
      };

      const socket = new WebSocket(url);

      const connection: GameSeatConnection = {
        sendChoice: (choice: PlayerChoiceEvent) => {
          if (socket.readyState !== WebSocket.OPEN) {
            console.error('Seat WS: send while not open', status);
            return false;
          }
          socket.send(
            JSON.stringify({ type: 'playerChoice', payload: choice }),
          );
          return true;
        },
        requestGameSnapshot: () => {
          if (socket.readyState !== WebSocket.OPEN) {
            console.error(
              'Seat WS: requestGameSnapshot while not open',
              status,
            );
            return false;
          }
          socket.send(
            JSON.stringify({ type: 'requestGameSnapshot', payload: {} }),
          );
          return true;
        },
        close: () => {
          socket.close();
        },
        subscribe: (listener) => {
          listeners.add(listener);
          if (pendingMessages.length > 0) {
            const queued = pendingMessages.splice(0);
            for (const message of queued) {
              listener(message);
            }
          }
          return () => {
            listeners.delete(listener);
          };
        },
        subscribeStatus: (listener) => {
          statusListeners.add(listener);
          listener(status);
          return () => {
            statusListeners.delete(listener);
          };
        },
      };

      socket.addEventListener('message', (event) => {
        const raw =
          typeof event.data === 'string' ? event.data : String(event.data);
        const message = parseGameSeatOutbound(side, raw);
        if (message === undefined) {
          return;
        }
        dispatch(message);
      });

      await waitForWebSocketOpen(socket, setStatus);

      socket.addEventListener('close', () => {
        setStatus('closed');
      });
      socket.addEventListener('error', () => {
        if (status === 'open') {
          setStatus('error');
        }
      });

      return connection;
    },
  };
}
