import type {
  Board,
  CardState,
  GameState,
  PlayerSide,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import { createMemo } from 'solid-js';
import type { BoardCellView } from './boardCellView';
import { projectBoardCells } from './boardCellView';
import type { GameStateStore } from './gameStateStore';

/** Safe phase readout; never calls `getExpectedEvent` (throws when phase is `'none'`). */
export type PhaseSummary =
  | { kind: 'none' }
  | { kind: 'phase'; phase: string; step: string };

export interface GameStateProjections {
  state: Accessor<GameState | undefined>;
  board: Accessor<Board | undefined>;
  boardCells: Accessor<Readonly<Partial<Record<string, BoardCellView>>>>;
  roundNumber: Accessor<number | undefined>;
  initiative: Accessor<PlayerSide | undefined>;
  phaseSummary: Accessor<PhaseSummary | undefined>;
  cardState: Accessor<CardState | undefined>;
  reservedUnits: Accessor<UnitInstance[] | undefined>;
  routedUnits: Accessor<UnitInstance[] | undefined>;
  lostCommanders: Accessor<PlayerSide[] | undefined>;
  hasGameState: Accessor<boolean>;
}

const phaseSummaryFromState = (state: GameState): PhaseSummary => {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (phaseState === 'none') {
    return { kind: 'none' };
  }
  return { kind: 'phase', phase: phaseState.phase, step: phaseState.step };
};

/**
 * Read-only accessors derived from the authoritative {@link GameStateStore}.
 */
export const createGameStateProjections = (
  store: GameStateStore,
): GameStateProjections => {
  const state = store.state;

  const board: Accessor<Board | undefined> = createMemo(
    () => state()?.boardState,
  );

  const boardCells = createMemo(() => projectBoardCells(board()));

  const roundNumber = createMemo(() => state()?.currentRoundNumber);

  const initiative = createMemo(() => state()?.currentInitiative);

  const phaseSummary = createMemo(() => {
    const s = state();
    return s === undefined ? undefined : phaseSummaryFromState(s);
  });

  const cardState = createMemo(() => state()?.cardState);

  const reservedUnits = createMemo(() => state()?.reservedUnits);

  const routedUnits = createMemo(() => state()?.routedUnits);

  const lostCommanders = createMemo(() => state()?.lostCommanders);

  const hasGameState = createMemo(() => state() !== undefined);

  return {
    state,
    board,
    boardCells,
    roundNumber,
    initiative,
    phaseSummary,
    cardState,
    reservedUnits,
    routedUnits,
    lostCommanders,
    hasGameState,
  };
};
