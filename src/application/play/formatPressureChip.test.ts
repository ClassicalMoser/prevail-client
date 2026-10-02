import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import { formatPressureChip } from './formatPressureChip';

describe('pressure chip', () => {
  it('names lost commanders by side word, not the raw key alone', () => {
    expect.hasAssertions();
    const sides: PlayerSide[] = ['white'];
    const chip = formatPressureChip({
      routedCount: 2,
      lostCommanders: sides,
    });

    expect(chip).toBe('2 routed · commanders lost: White');
  }, 1000);

  it('returns nothing when there is no pressure', () => {
    expect.hasAssertions();
    const chip = formatPressureChip({
      routedCount: 0,
      lostCommanders: [],
    });

    expect(chip).toBeUndefined();
  }, 1000);
});
