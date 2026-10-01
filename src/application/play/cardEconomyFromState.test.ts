import {
  createEmptyGameState,
  tempCommandCards,
  toHiddenCardState,
} from '@classicalmoser/prevail-rules/domain';
import type {
  CardState,
  GameState,
} from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import {
  cardEconomyFromState,
  formatCardEconomyMeter,
} from './cardEconomyFromState';

const withAuthoritativePiles = (): GameState => {
  const base = createEmptyGameState('mini');
  const cardState = base.cardState;
  // Empty games are authoritative. Keep their absent awaiting/in-play cards,
  // which the rules package stores as null, and only replace the piles under test.
  if (cardState.visibility !== 'authoritative') {
    throw new Error('expected authoritative empty state');
  }
  return {
    ...base,
    cardState: {
      visibility: 'authoritative',
      white: {
        ...cardState.white,
        inHand: [tempCommandCards[0], tempCommandCards[1]],
        played: [tempCommandCards[2]],
        discarded: [tempCommandCards[3]],
        burnt: [],
      },
      black: {
        ...cardState.black,
        inHand: [tempCommandCards[0]],
        played: [],
        discarded: [],
        burnt: [tempCommandCards[1], tempCommandCards[2]],
      },
    },
  };
};

const toWhiteSeen = (state: GameState): GameState => {
  const auth = state.cardState;
  if (auth.visibility !== 'authoritative') {
    throw new Error('expected authoritative');
  }
  const cardState: CardState = {
    visibility: 'whiteSeen',
    white: auth.white,
    black: toHiddenCardState(auth.black),
  };
  return { ...state, cardState };
};

describe('card economy counts', () => {
  it('returns zeros when state is missing', () => {
    expect.hasAssertions();
    expect(cardEconomyFromState(undefined, 'white')).toStrictEqual({
      you: { hand: 0, played: 0, discarded: 0, burnt: 0 },
      opponent: { hand: 0, played: 0, discarded: 0, burnt: 0 },
    });
  }, 1000);

  it('counts piles under authoritative visibility', () => {
    expect.hasAssertions();
    const state = withAuthoritativePiles();
    expect(cardEconomyFromState(state, 'white')).toStrictEqual({
      you: { hand: 2, played: 1, discarded: 1, burnt: 0 },
      opponent: { hand: 1, played: 0, discarded: 0, burnt: 2 },
    });
  }, 1000);

  it('counts opponent hand length on a seat fold without revealing cards', () => {
    expect.hasAssertions();
    const state = toWhiteSeen(withAuthoritativePiles());
    expect(cardEconomyFromState(state, 'white')).toStrictEqual({
      you: { hand: 2, played: 1, discarded: 1, burnt: 0 },
      opponent: { hand: 1, played: 0, discarded: 0, burnt: 2 },
    });
  }, 1000);
});

describe('card economy meter copy', () => {
  it('formats compact meter copy', () => {
    expect.hasAssertions();
    expect(
      formatCardEconomyMeter({
        hand: 4,
        played: 2,
        discarded: 1,
        burnt: 0,
      }),
    ).toBe('Hand 4 · Played 2 · Discard 1 · Burnt 0');
  }, 1000);
});
