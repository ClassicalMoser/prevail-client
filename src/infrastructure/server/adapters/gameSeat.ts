import {
  blackInGameWsContract,
  whiteInGameWsContract,
} from '@classicalmoser/prevail-contracts';
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

const contractForSide = (side: PlayerSide) =>
  side === 'white' ? whiteInGameWsContract : blackInGameWsContract;

const seatPath = (side: PlayerSide, gameId: string): string => {
  const contract = contractForSide(side);
  return contract.path.replace(':gameId', encodeURIComponent(gameId));
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

type GameSnapshotPayload = Extract<
  GameSeatOutbound,
  { type: 'gameSnapshot' }
>['payload'];

/** Minimal shape required to paint the board when full zod validation fails. */
const asStructuralGameSnapshot = (
  payload: unknown,
): GameSnapshotPayload | undefined => {
  if (payload === null || typeof payload !== 'object') {
    return undefined;
  }
  const record = payload as Record<string, unknown>;
  if (
    typeof record.id !== 'string' ||
    typeof record.gameMode !== 'string' ||
    record.gameState === null ||
    typeof record.gameState !== 'object'
  ) {
    return undefined;
  }
  return payload as GameSnapshotPayload;
};

const parseOutbound = (
  side: PlayerSide,
  raw: string,
): GameSeatOutbound | undefined => {
  let json: unknown;
  try {
    json = JSON.parse(raw) as unknown;
  } catch {
    console.error('Seat WS: invalid JSON', raw);
    return undefined;
  }

  if (
    json === null ||
    typeof json !== 'object' ||
    !('type' in json) ||
    !('payload' in json)
  ) {
    console.error('Seat WS: envelope missing type/payload', json);
    return undefined;
  }

  const type = (json as { type: unknown }).type;
  const payload = (json as { payload: unknown }).payload;
  const outbound = contractForSide(side).validators.outbound;

  switch (type) {
    case 'playerChoice': {
      const parsed = outbound.playerChoice.safeParse(payload);
      if (!parsed.success) {
        console.error('Seat WS: invalid playerChoice', parsed.error);
        return undefined;
      }
      return { type, payload: parsed.data } as GameSeatOutbound;
    }
    case 'gameEffect': {
      const parsed = outbound.gameEffect.safeParse(payload);
      if (!parsed.success) {
        console.error('Seat WS: invalid gameEffect', parsed.error);
        return undefined;
      }
      return { type, payload: parsed.data } as GameSeatOutbound;
    }
    case 'gameSnapshot': {
      const parsed = outbound.gameSnapshot.safeParse(payload);
      if (parsed.success) {
        return { type, payload: parsed.data } as GameSeatOutbound;
      }
      // Server is source of truth — still deliver if the envelope is structural.
      const structural = asStructuralGameSnapshot(payload);
      if (structural !== undefined) {
        console.error(
          'Seat WS: gameSnapshot failed schema; ingesting structural payload',
          parsed.error,
        );
        return { type, payload: structural } as GameSeatOutbound;
      }
      console.error(
        'Seat WS: invalid gameSnapshot — state will stay empty',
        parsed.error,
        payload,
      );
      return undefined;
    }
    case 'choiceRejected': {
      const parsed = outbound.choiceRejected.safeParse(payload);
      if (!parsed.success) {
        console.error('Seat WS: invalid choiceRejected', parsed.error);
        // Still surface a rejection so the UI can unlock and retry.
        return {
          type: 'choiceRejected',
          payload: {
            result: false,
            errorReason:
              'Choice rejected (unreadable server payload). You can retry.',
          },
        } as GameSeatOutbound;
      }
      return { type, payload: parsed.data } as GameSeatOutbound;
    }
    default: {
      console.error('Seat WS: unknown outbound type', type);
      return undefined;
    }
  }
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

      const setStatus = (next: GameSeatConnectionStatus) => {
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
        const message = parseOutbound(side, raw);
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
