import {
  createEmptyGameState,
  createUnitInstance,
  tempUnits,
} from '@classicalmoser/prevail-rules/domain';
import type {
  Coordinate,
  LegalPlayerChoiceOptions,
  UnitPlacement,
  UnitWithPlacement,
} from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import type { SeatSelection } from '@application/play/selection/core/types';
import { handleMoveUnitCellClick } from './handleMoveUnitCellClick';

function stagedMoveUnit(
  selection: SeatSelection,
): UnitWithPlacement | undefined {
  if (selection.kind !== 'moveUnit') {
    return undefined;
  }
  return selection.unit;
}

const blackEquites = (coordinate: Coordinate): UnitWithPlacement => ({
  unit: createUnitInstance('black', tempUnits[0], 1),
  placement: { coordinate, facing: 'north' },
});

describe('staging a move when the selected unit is clicked again', () => {
  it('stages the origin when re-clicking the selected unit (stay / rotate in place)', () => {
    expect.hasAssertions();
    const origin: Coordinate = 'E-5';
    const unit = blackEquites(origin);
    const options = {
      choiceType: 'moveUnit' as const,
      expectedEventNumber: 1,
      playerSource: 'black' as const,
      moveUnits: {
        player: 'black' as const,
        units: [unit],
      },
    } satisfies Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }>;

    const state = createEmptyGameState('mini');
    const destinations: UnitPlacement[] = [
      { coordinate: origin, facing: 'north' },
      { coordinate: origin, facing: 'northEast' },
      { coordinate: 'E-4', facing: 'north' },
    ];
    const selected: SeatSelection = {
      kind: 'moveUnit',
      unit,
      destinations,
      pendingDestination: undefined,
    };

    const result = handleMoveUnitCellClick({
      coordinate: origin,
      options,
      selection: selected,
      state,
    });

    expect(result.selection).toMatchObject({
      kind: 'moveUnit',
      pendingDestination: origin,
    });
    expect(stagedMoveUnit(result.selection)).toBe(unit);
  }, 1000);
});
