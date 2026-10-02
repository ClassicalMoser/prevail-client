import type { GameSeatConnectionStatus } from '@ports';
import { describe, expect, it } from 'vite-plus/test';
import { connectionStatusLabel } from './connectionStatusLabel';

describe('connection status labels', () => {
  it('names an open seat stream in words', () => {
    expect.hasAssertions();
    const status: GameSeatConnectionStatus = 'open';
    const label = connectionStatusLabel(status);

    expect(label).toBe('Connected');
  }, 1000);

  it('names a connecting seat stream without the raw key', () => {
    expect.hasAssertions();
    const status: GameSeatConnectionStatus = 'connecting';
    const label = connectionStatusLabel(status);

    expect(label).toBe('Connecting');
  }, 1000);
});
