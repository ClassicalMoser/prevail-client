import type {
  CardState,
  GameState,
} from '@classicalmoser/prevail-rules/domain';
import {
  createEmptyGameState,
  tempCommandCards,
  toHiddenCardState,
} from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import {
  cardEconomyFromState,
  formatCardEconomyMeter,
} from './cardEconomyFromState';

const withAuthoritativePiles = (): GameState => {
  const base = createEmptyGameState('mini');
  return {
    ...base,
    cardState: {
      visibility: 'authoritative',
      white: {
        awaitingPlay: null,
        inPlay: null,
        inHand: [tempCommandCards[0], tempCommandCards[1]],
        played: [tempCommandCards[2]],
        discarded: [tempCommandCards[3]],
        burnt: [],
      },
      black: {
        awaitingPlay: null,
        inPlay: null,
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

describe(cardEconomyFromState, () => {
  it('returns zeros when state is missing', () => {
    expect(cardEconomyFromState(undefined, 'white')).toStrictEqual({
      you: { hand: 0, played: 0, discarded: 0, burnt: 0 },
      opponent: { hand: 0, played: 0, discarded: 0, burnt: 0 },
    });
  });

  it('counts piles under authoritative visibility', () => {
    const state = withAuthoritativePiles();
    expect(cardEconomyFromState(state, 'white')).toStrictEqual({
      you: { hand: 2, played: 1, discarded: 1, burnt: 0 },
      opponent: { hand: 1, played: 0, discarded: 0, burnt: 2 },
    });
  });

  it('counts opponent hand length on a seat fold without revealing cards', () => {
    const state = toWhiteSeen(withAuthoritativePiles());
    expect(cardEconomyFromState(state, 'white')).toStrictEqual({
      you: { hand: 2, played: 1, discarded: 1, burnt: 0 },
      opponent: { hand: 1, played: 0, discarded: 0, burnt: 2 },
    });
  });
});

describe(formatCardEconomyMeter, () => {
  it('formats compact meter copy', () => {
    expect(
      formatCardEconomyMeter({
        hand: 4,
        played: 2,
        discarded: 1,
        burnt: 0,
      }),
    ).toBe('Hand 4 · Played 2 · Discard 1 · Burnt 0');
  });
});
