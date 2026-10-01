import {
  addUnitToBoard,
  createEmptyStandardBoard,
  createUnitInstance,
  tempUnits,
} from '@classicalmoser/prevail-rules/domain';
import type { Board, Coordinate } from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import { projectBoardCells } from './boardCellView';

function firstCoordinate(board: Board): Coordinate {
  const key = Object.keys(board.board)[0];
  if (key === undefined) {
    throw new Error('empty board');
  }
  // Object.keys widens a board coordinate to string. The key came from that board.
  return key as Coordinate;
}

describe('board cell labels', () => {
  it('names a unit by its side and type', () => {
    expect.hasAssertions();
    const empty = createEmptyStandardBoard();
    const coordinate = firstCoordinate(empty);
    const unit = createUnitInstance('white', tempUnits[0], 4);
    const board = addUnitToBoard(empty, {
      unit,
      placement: { coordinate, facing: 'north' },
    });
    const cells = projectBoardCells(board);
    const label = cells[coordinate]?.units[0]?.label;

    expect(label).toBe(`White ${unit.unitType.name}`);
  }, 1000);
});
