import { describe, expect, it } from 'vite-plus/test';
import { composeRoundKey } from './composeRoundKey';

describe('round storage key', () => {
  it('joins the game id and the round number', () => {
    expect.hasAssertions();
    const key = composeRoundKey('game-1', 3);

    expect(key).toBe('game-1::3');
  }, 1000);
});
