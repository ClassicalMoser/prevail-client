import type {
  GameState,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import {
  getHiddenPlayerCardState,
  getOwnedPlayerCardState,
} from '@classicalmoser/prevail-rules/domain';
import { oppositeSide } from './playVisibility';

export interface SideCardEconomy {
  hand: number;
  played: number;
  discarded: number;
  burnt: number;
}

export interface CardEconomyView {
  you: SideCardEconomy;
  opponent: SideCardEconomy;
}

const emptyEconomy = (): SideCardEconomy => ({
  hand: 0,
  played: 0,
  discarded: 0,
  burnt: 0,
});

const countsFromPiles = (piles: {
  inHand: readonly unknown[];
  played: readonly unknown[];
  discarded: readonly unknown[];
  burnt: readonly unknown[];
}): SideCardEconomy => ({
  hand: piles.inHand.length,
  played: piles.played.length,
  discarded: piles.discarded.length,
  burnt: piles.burnt.length,
});

/**
 * Seat-safe hand/pile counts for you and opponent (identities never exposed).
 */
export function cardEconomyFromState(
  state: GameState | undefined,
  humanSide: PlayerSide,
): CardEconomyView {
  if (state === undefined) {
    return { you: emptyEconomy(), opponent: emptyEconomy() };
  }

  const { cardState } = state;
  const oppSide = oppositeSide(humanSide);

  if (cardState.visibility === 'authoritative') {
    return {
      you: countsFromPiles(cardState[humanSide]),
      opponent: countsFromPiles(cardState[oppSide]),
    };
  }

  try {
    return {
      you: countsFromPiles(getOwnedPlayerCardState(cardState, humanSide)),
      opponent: countsFromPiles(getHiddenPlayerCardState(cardState, oppSide)),
    };
  } catch {
    return { you: emptyEconomy(), opponent: emptyEconomy() };
  }
}

export function formatCardEconomyMeter(economy: SideCardEconomy): string {
  return `Hand ${economy.hand} · Played ${economy.played} · Discard ${economy.discarded} · Burnt ${economy.burnt}`;
}
