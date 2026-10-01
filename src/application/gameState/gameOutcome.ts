import { getGameOverWinner } from '@classicalmoser/prevail-rules/domain';
import type {
  GameState,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import { playerSideLabel } from './playerSideLabel';

/**
 * Client-facing endgame readout from authoritative state.
 * - `ongoing` — play continues
 * - `ending` — loss conditions met; `gameOver` effect not applied yet
 * - `finished` — `GameState.winner` set (`null` = draw)
 *
 * Both `ending` and `finished` carry the determined winner so the seat UI can
 * show Victory / Defeat / Draw immediately.
 */
type GameOutcome =
  | { status: 'ongoing' }
  | { status: 'ending'; winner: PlayerSide | null }
  | { status: 'finished'; winner: PlayerSide | null };

function gameOutcomeFromState(state?: GameState): GameOutcome {
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
function gameOutcomeHeadline(
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
function gameOutcomeDetail(
  outcome: GameOutcome,
  humanSide: PlayerSide,
): string | undefined {
  if (outcome.status === 'ongoing') {
    return undefined;
  }
  const winner = outcomeWinner(outcome);
  if (outcome.status === 'ending') {
    if (winner === null) {
      const resolvingDraw = 'Resolving a draw…';
      return resolvingDraw;
    }
    const side = playerSideLabel(winner);
    if (winner === humanSide) {
      const resolvingWin = 'You won — resolving final result…';
      return resolvingWin;
    }
    const resolvingLoss = `${side} wins — resolving final result…`;
    return resolvingLoss;
  }
  if (winner === null) {
    const draw = 'The match ends in a draw.';
    return draw;
  }
  if (winner === humanSide) {
    const win = 'You won this match.';
    return win;
  }
  const side = playerSideLabel(winner);
  const loss = `${side} wins.`;
  return loss;
}

export {
  type GameOutcome,
  gameOutcomeFromState,
  gameOutcomeHeadline,
  gameOutcomeDetail,
};
