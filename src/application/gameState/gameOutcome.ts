import type {
  GameState,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import { getGameOverWinner } from '@classicalmoser/prevail-rules/domain';

/**
 * Client-facing endgame readout from authoritative state.
 * - `ongoing` — play continues
 * - `ending` — loss conditions met; `gameOver` effect not applied yet
 * - `finished` — `GameState.winner` set (`null` = draw)
 *
 * Both `ending` and `finished` carry the determined winner so the seat UI can
 * show Victory / Defeat / Draw immediately.
 */
export type GameOutcome =
  | { status: 'ongoing' }
  | { status: 'ending'; winner: PlayerSide | null }
  | { status: 'finished'; winner: PlayerSide | null };

export function gameOutcomeFromState(
  state: GameState | undefined,
): GameOutcome {
  if (state === undefined) {
    return { status: 'ongoing' };
  }
  if (state.winner !== undefined) {
    return { status: 'finished', winner: state.winner };
  }
  const pending = getGameOverWinner(state);
  if (pending !== undefined) {
    return { status: 'ending', winner: pending };
  }
  return { status: 'ongoing' };
}

function outcomeWinner(
  outcome: Extract<GameOutcome, { status: 'ending' | 'finished' }>,
): PlayerSide | null {
  return outcome.winner;
}

/** Seat-relative short title for banners / header. */
export function gameOutcomeHeadline(
  outcome: GameOutcome,
  humanSide: PlayerSide,
): string | undefined {
  if (outcome.status === 'ongoing') {
    return undefined;
  }
  const winner = outcomeWinner(outcome);
  if (winner === null) {
    return 'Draw';
  }
  return winner === humanSide ? 'Victory' : 'Defeat';
}

/** Seat-relative supporting line. */
export function gameOutcomeDetail(
  outcome: GameOutcome,
  humanSide: PlayerSide,
): string | undefined {
  if (outcome.status === 'ongoing') {
    return undefined;
  }
  const winner = outcomeWinner(outcome);
  if (outcome.status === 'ending') {
    if (winner === null) {
      return 'Resolving a draw…';
    }
    return winner === humanSide
      ? 'You won — resolving final result…'
      : `${winner} wins — resolving final result…`;
  }
  if (winner === null) {
    return 'The match ends in a draw.';
  }
  if (winner === humanSide) {
    return 'You won this match.';
  }
  return `${winner} wins.`;
}
