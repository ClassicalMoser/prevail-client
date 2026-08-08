import type {
  Board,
  Coordinate,
  GameState,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import {
  createEmptyGameState,
  createUnitInstance,
  tempCommandCards,
  tempUnits,
  updatePhaseState,
} from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import {
  combatContextFromState,
  engagementLabelAtCoordinate,
  formatCombatEngagementLine,
  formatCommitmentStatus,
} from './combatContextFromState';

const firstCoord = (board: Board): Coordinate => {
  const key = Object.keys(board.board)[0];
  if (key === undefined) {
    throw new Error('empty board');
  }
  return key as Coordinate;
};

const placeEngagedPair = (board: Board, coordinate: Coordinate): Board => {
  const whiteUnit: UnitInstance = createUnitInstance('white', tempUnits[1], 1);
  const blackUnit: UnitInstance = createUnitInstance('black', tempUnits[0], 1);
  const space = board.board[coordinate];
  if (space === undefined) {
    throw new Error(`missing space ${coordinate}`);
  }
  return {
    ...board,
    board: {
      ...board.board,
      [coordinate]: {
        ...space,
        unitPresence: {
          presenceType: 'engaged',
          primaryUnit: whiteUnit,
          primaryFacing: 'north',
          secondaryUnit: blackUnit,
        },
      },
    },
  };
};

const meleeState = (): GameState => {
  const base = createEmptyGameState('mini');
  const location = firstCoord(base.boardState);
  const board = placeEngagedPair(base.boardState, location);
  return updatePhaseState(
    { ...base, boardState: board },
    {
      phase: 'resolveMelee',
      step: 'resolveMelee',
      remainingEngagements: [location],
      currentMeleeResolutionState: {
        substepType: 'meleeResolution',
        location,
        whiteAttackApplyState: 'pending',
        blackAttackApplyState: 'pending',
        whiteCommitment: { commitmentType: 'pending' },
        blackCommitment: {
          commitmentType: 'completed',
          card: 'hidden',
        },
        completed: false,
      },
    },
  );
};

describe(combatContextFromState, () => {
  it('returns null outside resolveMelee', () => {
    expect(combatContextFromState(createEmptyGameState('mini'))).toBeNull();
    expect(combatContextFromState()).toBeNull();
  });

  it('surfaces location, units, and commitment status during melee', () => {
    const context = combatContextFromState(meleeState());
    expect(context).not.toBeNull();
    expect(context?.kind).toBe('melee');
    expect(context?.units).toHaveLength(2);
    expect(context?.whiteCommitment).toStrictEqual({ kind: 'pending' });
    expect(context?.blackCommitment).toStrictEqual({
      kind: 'completed',
      cardLabel: 'Hidden',
    });
  });

  it('labels completed revealed commitments by card name', () => {
    const state = meleeState();
    const phase = state.currentRoundState.currentPhaseState;
    if (phase === 'none' || phase.phase !== 'resolveMelee') {
      throw new Error('expected resolveMelee');
    }
    if (phase.currentMeleeResolutionState === 'pending') {
      throw new Error('expected melee state');
    }
    const withReveal = updatePhaseState(state, {
      ...phase,
      currentMeleeResolutionState: {
        ...phase.currentMeleeResolutionState,
        whiteCommitment: {
          commitmentType: 'completed',
          card: tempCommandCards[0],
        },
        blackCommitment: { commitmentType: 'declined' },
      },
    });
    const context = combatContextFromState(withReveal);
    expect(context?.whiteCommitment).toStrictEqual({
      kind: 'completed',
      cardLabel: tempCommandCards[0].name,
    });
    expect(context?.blackCommitment).toStrictEqual({ kind: 'declined' });
  });
});

describe(engagementLabelAtCoordinate, () => {
  it('falls back to Resolve coord when empty', () => {
    const board = createEmptyGameState('mini').boardState;
    const coord = firstCoord(board);
    expect(engagementLabelAtCoordinate(board, coord)).toBe(`Resolve ${coord}`);
  });

  it('names engaged pair', () => {
    const base = createEmptyGameState('mini').boardState;
    const coord = firstCoord(base);
    const board = placeEngagedPair(base, coord);
    const label = engagementLabelAtCoordinate(board, coord);
    expect(label).toContain('vs');
    expect(label).toContain(coord);
  });
});

describe('combat formatters', () => {
  it('formats engagement and commitment lines', () => {
    const context = combatContextFromState(meleeState());
    if (context === null) {
      throw new Error('expected context');
    }
    expect(formatCombatEngagementLine(context)).toContain('vs');
    expect(formatCommitmentStatus({ kind: 'pending' })).toBe('Pending');
    expect(formatCommitmentStatus({ kind: 'declined' })).toBe('Declined');
    expect(
      formatCommitmentStatus({ kind: 'completed', cardLabel: 'Advance' }),
    ).toBe('Advance');
  });
});
