import { describe, expect, it } from 'vite-plus/test';
import { playerChoiceTitle } from './playerChoiceTitle';

describe('player choice titles', () => {
  it('names a known choice in words', () => {
    expect.hasAssertions();
    const title = playerChoiceTitle('chooseRoutDiscard');

    expect(title).toBe('Rout discard');
  }, 1000);

  it('spaces an unknown choice instead of showing the raw key', () => {
    expect.hasAssertions();
    const title = playerChoiceTitle('futureChoice');

    expect(title).toBe('Future Choice');
  }, 1000);

  it('returns nothing when there is no choice', () => {
    expect.hasAssertions();
    const title = playerChoiceTitle();

    expect(title).toBeUndefined();
  }, 1000);
});
