/* Seat traffic debug aid — intentional console output. */
/* eslint-disable no-console -- stream logger */
import type { GameState } from '@classicalmoser/prevail-rules/domain';
import type { GameSeatOutbound } from '@ports';

function phaseStepLabel(state: GameState | undefined): string {
  if (state === undefined) {
    return '(no state)';
  }
  const phaseState = state.currentRoundState.currentPhaseState;
  if (phaseState === 'none') {
    return 'pre-phase';
  }
  return `${phaseState.phase}/${phaseState.step}`;
}

function eventHead(payload: unknown): string {
  if (payload === null || typeof payload !== 'object') {
    return typeof payload;
  }
  const record = payload as Record<string, unknown>;
  const eventType = record.eventType;
  const choiceType = record.choiceType;
  const effectType = record.effectType;
  const eventNumber = record.eventNumber;
  const parts = [
    typeof eventType === 'string' ? eventType : undefined,
    typeof choiceType === 'string' ? choiceType : undefined,
    typeof effectType === 'string' ? effectType : undefined,
    typeof eventNumber === 'number' ? `#${eventNumber}` : undefined,
  ].filter((part): part is string => part !== undefined);
  return parts.length > 0 ? parts.join(' ') : 'event';
}

/** Dev aid: print seat WS traffic and fold outcomes to the browser console. */
export function logSeatStreamInbound(
  message: GameSeatOutbound,
  fold?: { before: GameState | undefined; after?: GameState; error?: unknown },
): void {
  switch (message.type) {
    case 'gameSnapshot': {
      const state = message.payload.gameState as GameState;
      console.log('[seat stream] ← snapshot', {
        gameId: message.payload.id,
        phase: phaseStepLabel(state),
        events: state.currentRoundState.events.length,
        initiative: state.currentInitiative,
      });
      break;
    }
    case 'playerChoice':
    case 'gameEffect': {
      console.log(
        `[seat stream] ← ${message.type}`,
        eventHead(message.payload),
        {
          payload: message.payload,
          phaseBefore: phaseStepLabel(fold?.before),
          phaseAfter:
            fold?.error !== undefined
              ? `fold failed: ${String(fold.error)}`
              : phaseStepLabel(fold?.after),
        },
      );
      break;
    }
    case 'choiceRejected': {
      console.warn('[seat stream] ← choiceRejected', message.payload);
      break;
    }
    default: {
      console.log('[seat stream] ←', message);
    }
  }
}

export function logSeatStreamOutbound(choice: unknown): void {
  console.log('[seat stream] → playerChoice', eventHead(choice), choice);
}

export function logSeatStreamSnapshotRequest(): void {
  console.log('[seat stream] → requestGameSnapshot');
}
