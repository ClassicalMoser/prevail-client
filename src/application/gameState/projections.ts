import type {
  Board,
  CardState,
  GameState,
  PlayerSide,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import { createMemo } from 'solid-js';
import type { Accessor } from 'solid-js';
import { projectBoardCells } from './boardCellView';
import type { BoardCellView } from './boardCellView';
import { gameOutcomeFromState } from './gameOutcome';
import type { GameOutcome } from './gameOutcome';
import type { GameStateStore } from './gameStateStore';
import { phaseLabel, phaseSummaryFromState } from './phaseSummary';
import type { PhaseSummary } from './phaseSummary';
import { playerSideLabel } from './playerSideLabel';

interface GameStateProjections {
  state: Accessor<GameState | undefined>;
  board: Accessor<Board | undefined>;
  boardCells: Accessor<Readonly<Partial<Record<string, BoardCellView>>>>;
  roundNumber: Accessor<number | undefined>;
  initiative: Accessor<PlayerSide | undefined>;
  /** Player-facing initiative. `undefined` until a game is loaded. */
  initiativeLabel: Accessor<string | undefined>;
  phaseSummary: Accessor<PhaseSummary | undefined>;
  /** Player-facing phase line, including the empty-state dash. */
  phaseLabel: Accessor<string>;
  cardState: Accessor<CardState | undefined>;
  reservedUnits: Accessor<UnitInstance[] | undefined>;
  routedUnits: Accessor<UnitInstance[] | undefined>;
  lostCommanders: Accessor<PlayerSide[] | undefined>;
  /** Endgame status from {@link GameState.winner} / pending game-over checks. */
  outcome: Accessor<GameOutcome>;
  hasGameState: Accessor<boolean>;
}

/**
 * Read-only accessors derived from the authoritative {@link GameStateStore}.
 * Display strings are computed here so a view renders them as given.
 */
const createGameStateProjections = (
  store: GameStateStore,
): GameStateProjections => {
  const state = store.state;

  const board: Accessor<Board | undefined> = createMemo(
    () => state()?.boardState,
  );

  const boardCells = createMemo(() => projectBoardCells(board()));

  const roundNumber = createMemo(() => state()?.currentRoundNumber);

  const initiative = createMemo(() => state()?.currentInitiative);

  const initiativeLabel = createMemo(() => {
    const side = initiative();
    if (side === undefined) {
      return;
    }
    const label = playerSideLabel(side);
    return label;
  });

  const phaseSummary = createMemo(() => {
    const current = state();
    if (current === undefined) {
      return;
    }
    const summary = phaseSummaryFromState(current);
    return summary;
  });

  const labeledPhase = createMemo(() => phaseLabel(phaseSummary()));

  const cardState = createMemo(() => state()?.cardState);

  const reservedUnits = createMemo(() => state()?.reservedUnits);

  const routedUnits = createMemo(() => state()?.routedUnits);

  const lostCommanders = createMemo(() => state()?.lostCommanders);

  const outcome = createMemo(() => gameOutcomeFromState(state()));

  const hasGameState = createMemo(() => state() !== undefined);

  const projections: GameStateProjections = {
    state,
    board,
    boardCells,
    roundNumber,
    initiative,
    initiativeLabel,
    phaseSummary,
    phaseLabel: labeledPhase,
    cardState,
    reservedUnits,
    routedUnits,
    lostCommanders,
    outcome,
    hasGameState,
  };
  return projections;
};

export { type GameStateProjections, createGameStateProjections };
