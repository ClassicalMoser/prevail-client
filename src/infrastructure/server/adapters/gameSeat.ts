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
      if (!parsed.success) {
        console.error('Seat WS: invalid gameSnapshot', parsed.error);
        return undefined;
      }
      return { type, payload: parsed.data } as GameSeatOutbound;
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
      let status: GameSeatConnectionStatus = 'connecting';

      const setStatus = (next: GameSeatConnectionStatus) => {
        status = next;
        for (const listener of statusListeners) {
          listener(next);
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
            console.error('Seat WS: requestGameSnapshot while not open', status);
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

      socket.addEventListener('open', () => {
        setStatus('open');
      });
      socket.addEventListener('close', () => {
        setStatus('closed');
      });
      socket.addEventListener('error', () => {
        setStatus('error');
      });
      socket.addEventListener('message', (event) => {
        const raw =
          typeof event.data === 'string' ? event.data : String(event.data);
        const message = parseOutbound(side, raw);
        if (message === undefined) {
          return;
        }
        for (const listener of listeners) {
          listener(message);
        }
      });

      return connection;
    },
  };
}
