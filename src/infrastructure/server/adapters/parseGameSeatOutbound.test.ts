import type { GameSeatOutbound } from '@ports';
import { describe, expect, it } from 'vite-plus/test';
import {
  parseGameSeatOutbound,
  structuralGameSnapshot,
} from './parseGameSeatOutbound';

describe('structural game snapshot', () => {
  it('accepts a payload with id, gameMode, and gameState object', () => {
    expect.hasAssertions();
    const payload = {
      id: 'game-1',
      gameMode: 'mini',
      gameState: { currentRoundNumber: 1 },
    };
    const snapshot = structuralGameSnapshot(payload);

    expect(snapshot?.id).toBe('game-1');
  }, 1000);

  it('rejects a payload missing gameState', () => {
    expect.hasAssertions();
    const snapshot = structuralGameSnapshot({
      id: 'game-1',
      gameMode: 'mini',
    });

    expect(snapshot).toBeUndefined();
  }, 1000);
});

describe('parse game seat outbound', () => {
  it('returns nothing for invalid JSON', () => {
    expect.hasAssertions();
    const message = parseGameSeatOutbound('white', 'not-json');

    expect(message).toBeUndefined();
  }, 1000);

  it('returns nothing when the envelope lacks type and payload', () => {
    expect.hasAssertions();
    const message = parseGameSeatOutbound('white', JSON.stringify({ x: 1 }));

    expect(message).toBeUndefined();
  }, 1000);

  it('synthesizes a readable choiceRejected when the payload fails schema', () => {
    expect.hasAssertions();
    const message = parseGameSeatOutbound(
      'white',
      JSON.stringify({ type: 'choiceRejected', payload: { broken: true } }),
    );
    // Narrow the union so the assertion can read the rejection reason.
    const rejected = message as
      | Extract<GameSeatOutbound, { type: 'choiceRejected' }>
      | undefined;

    expect(rejected?.type).toBe('choiceRejected');
    expect(rejected?.payload.errorReason).toBe(
      'Choice rejected (unreadable server payload). You can retry.',
    );
  }, 1000);

  it('ingests a structural gameSnapshot when zod rejects the payload', () => {
    expect.hasAssertions();
    const message = parseGameSeatOutbound(
      'white',
      JSON.stringify({
        type: 'gameSnapshot',
        payload: {
          id: 'game-1',
          gameMode: 'mini',
          gameState: { currentRoundNumber: 1 },
        },
      }),
    );
    // Narrow the union so the assertion can read the snapshot id.
    const snapshot = message as
      | Extract<GameSeatOutbound, { type: 'gameSnapshot' }>
      | undefined;

    expect(snapshot?.type).toBe('gameSnapshot');
    expect(snapshot?.payload.id).toBe('game-1');
  }, 1000);
});
