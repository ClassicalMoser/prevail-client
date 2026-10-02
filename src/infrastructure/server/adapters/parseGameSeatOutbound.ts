import {
  blackInGameWsContract,
  whiteInGameWsContract,
} from '@classicalmoser/prevail-contracts';
import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import type { GameSeatOutbound } from '@ports';

type GameSnapshotPayload = Extract<
  GameSeatOutbound,
  { type: 'gameSnapshot' }
>['payload'];

type SideContract =
  | typeof whiteInGameWsContract
  | typeof blackInGameWsContract;

function contractForSide(side: PlayerSide): SideContract {
  if (side === 'white') {
    return whiteInGameWsContract;
  }
  return blackInGameWsContract;
}

/**
 * Minimal shape required to paint the board when full zod validation fails.
 * Fields beyond id / gameMode / gameState are trusted from the server envelope.
 */
function structuralGameSnapshot(
  payload: unknown,
): GameSnapshotPayload | undefined {
  if (payload === null || typeof payload !== 'object') {
    return undefined;
  }
  if (
    !('id' in payload) ||
    !('gameMode' in payload) ||
    !('gameState' in payload)
  ) {
    return undefined;
  }
  const { id, gameMode, gameState } = payload;
  if (typeof id !== 'string' || typeof gameMode !== 'string') {
    return undefined;
  }
  if (gameState === null || typeof gameState !== 'object') {
    return undefined;
  }
  // Server is source of truth; only the envelope was shape-checked above.
  // Full GameForVisibility is too large to reconstruct field-by-field here.
  const snapshot: GameSnapshotPayload = payload as GameSnapshotPayload;
  return snapshot;
}

function readEnvelope(
  json: unknown,
): { type: unknown; payload: unknown } | undefined {
  if (json === null || typeof json !== 'object') {
    return undefined;
  }
  if (!('type' in json) || !('payload' in json)) {
    return undefined;
  }
  const envelope = { type: json.type, payload: json.payload };
  return envelope;
}

/**
 * Parse a seat WebSocket text frame into a typed outbound message.
 * Undefined when the frame is not usable. Structural gameSnapshot and
 * synthetic choiceRejected keep the seat recoverable when zod rejects.
 */
function parseGameSeatOutbound(
  side: PlayerSide,
  raw: string,
): GameSeatOutbound | undefined {
  let json: unknown = undefined;
  try {
    json = JSON.parse(raw);
  } catch {
    console.error('Seat WS: invalid JSON', raw);
    return undefined;
  }

  const envelope = readEnvelope(json);
  if (envelope === undefined) {
    console.error('Seat WS: envelope missing type/payload', json);
    return undefined;
  }

  const { type, payload } = envelope;
  const outbound = contractForSide(side).validators.outbound;

  switch (type) {
    case 'playerChoice': {
      const parsed = outbound.playerChoice.safeParse(payload);
      if (!parsed.success) {
        console.error('Seat WS: invalid playerChoice', parsed.error);
        return undefined;
      }
      const message = {
        type: 'playerChoice' as const,
        payload: parsed.data,
      };
      return message as GameSeatOutbound;
    }
    case 'gameEffect': {
      const parsed = outbound.gameEffect.safeParse(payload);
      if (!parsed.success) {
        console.error('Seat WS: invalid gameEffect', parsed.error);
        return undefined;
      }
      const message = {
        type: 'gameEffect' as const,
        payload: parsed.data,
      };
      return message as GameSeatOutbound;
    }
    case 'gameSnapshot': {
      const parsed = outbound.gameSnapshot.safeParse(payload);
      if (parsed.success) {
        const message = {
          type: 'gameSnapshot' as const,
          payload: parsed.data,
        };
        return message as GameSeatOutbound;
      }
      const structural = structuralGameSnapshot(payload);
      if (structural !== undefined) {
        console.error(
          'Seat WS: gameSnapshot failed schema; ingesting structural payload',
          parsed.error,
        );
        const message = {
          type: 'gameSnapshot' as const,
          payload: structural,
        };
        return message as GameSeatOutbound;
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
        const message = {
          type: 'choiceRejected' as const,
          payload: {
            result: false as const,
            errorReason:
              'Choice rejected (unreadable server payload). You can retry.',
          },
        };
        return message as GameSeatOutbound;
      }
      const message = {
        type: 'choiceRejected' as const,
        payload: parsed.data,
      };
      return message as GameSeatOutbound;
    }
    default: {
      console.error('Seat WS: unknown outbound type', type);
      return undefined;
    }
  }
}

export { contractForSide, parseGameSeatOutbound, structuralGameSnapshot };
