import type {
  Board,
  BoardSpace,
  PlayerSide,
  UnitFacing,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import {
  getOppositeFacing,
  hasEngagedUnits,
  hasSingleUnit,
} from '@classicalmoser/prevail-rules/domain';
import { resolveUnitArtSrc } from './unitArt';

export interface BoardUnitView {
  label: string;
  facing: UnitFacing;
  imageSrc: string | undefined;
  playerSide: PlayerSide;
}

export interface BoardCellView {
  coordinate: string;
  commanders: PlayerSide[];
  units: BoardUnitView[];
}

const unitLabel = (unit: UnitInstance): string =>
  `${unit.unitType.name} (${unit.playerSide} #${unit.instanceNumber})`;

const toUnitView = (unit: UnitInstance, facing: UnitFacing): BoardUnitView => ({
  label: unitLabel(unit),
  facing,
  imageSrc: resolveUnitArtSrc(unit.unitType.name),
  playerSide: unit.playerSide,
});

export const boardSpaceToCellView = (
  coordinate: string,
  space: BoardSpace,
): BoardCellView => {
  const units: BoardUnitView[] = [];
  const presence = space.unitPresence;

  if (hasSingleUnit(presence)) {
    units.push(toUnitView(presence.unit, presence.facing));
  } else if (hasEngagedUnits(presence)) {
    units.push(toUnitView(presence.primaryUnit, presence.primaryFacing));
    units.push(
      toUnitView(
        presence.secondaryUnit,
        getOppositeFacing(presence.primaryFacing),
      ),
    );
  }

  return {
    coordinate,
    commanders: space.commanders,
    units,
  };
};

/**
 * Builds a coordinate → cell view map from board state for dumb board rendering.
 */
export const projectBoardCells = (
  board: Board | undefined,
): Readonly<Partial<Record<string, BoardCellView>>> => {
  if (!board) {
    return {};
  }

  const cells: Partial<Record<string, BoardCellView>> = {};
  for (const [coordinate, space] of Object.entries(board.board)) {
    if (space === undefined) {
      continue;
    }
    cells[coordinate] = boardSpaceToCellView(coordinate, space);
  }
  return cells;
};
