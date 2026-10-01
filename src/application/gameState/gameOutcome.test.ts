import { createEmptyGameState } from '@classicalmoser/prevail-rules/domain';
import type { GameState } from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import {
  gameOutcomeDetail,
  gameOutcomeFromState,
  gameOutcomeHeadline,
} from './gameOutcome';

function finishedByWhite(state: GameState): GameState {
  const finished: GameState = { ...state, winner: 'white' };
  return finished;
}

describe('game outcome labels', () => {
  it('reads a missing snapshot as ongoing', () => {
    expect.hasAssertions();
    const outcome = gameOutcomeFromState();

    expect(outcome).toStrictEqual({ status: 'ongoing' });
    expect(gameOutcomeHeadline(outcome, 'white')).toBeUndefined();
    expect(gameOutcomeDetail(outcome, 'white')).toBeUndefined();
  }, 1000);

  it('reads two empty hands as a draw that is still resolving', () => {
    expect.hasAssertions();
    const state = createEmptyGameState('standard');
    const outcome = gameOutcomeFromState(state);

    expect(outcome).toStrictEqual({ status: 'ending', winner: null });
    expect(gameOutcomeHeadline(outcome, 'white')).toBe('Draw');
    expect(gameOutcomeDetail(outcome, 'black')).toBe('Resolving a draw…');
  }, 1000);

  it('names the winner as White or Black once the match is finished', () => {
    expect.hasAssertions();
    const state = finishedByWhite(createEmptyGameState('standard'));
    const outcome = gameOutcomeFromState(state);

    expect(outcome).toStrictEqual({ status: 'finished', winner: 'white' });
    expect(gameOutcomeHeadline(outcome, 'white')).toBe('Victory');
    expect(gameOutcomeHeadline(outcome, 'black')).toBe('Defeat');
    expect(gameOutcomeDetail(outcome, 'white')).toBe('You won this match.');
    expect(gameOutcomeDetail(outcome, 'black')).toBe('White wins.');
  }, 1000);
});
