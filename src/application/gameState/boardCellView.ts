import {
  getOppositeFacing,
  hasEngagedUnits,
  hasSingleUnit,
} from '@classicalmoser/prevail-rules/domain';
import type {
  Board,
  BoardSpace,
  PlayerSide,
  UnitFacing,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import { playerSideLabel } from './playerSideLabel';
import { resolveUnitArtSrc } from './unitArt';

interface BoardUnitView {
  label: string;
  facing: UnitFacing;
  imageSrc: string | undefined;
  playerSide: PlayerSide;
  /** Published unit card identity for hover stat preview. */
  unitTypeId: string;
  unitTypeVersion: string;
  unitTypeName: string;
}

interface BoardCellView {
  coordinate: string;
  commanders: PlayerSide[];
  units: BoardUnitView[];
}

/** Player-facing unit name: side and type, no instance number. */
function unitInstanceLabel(unit: UnitInstance): string {
  const side = playerSideLabel(unit.playerSide);
  const name = unit.unitType.name;
  const label = `${side} ${name}`;
  return label;
}

const toUnitView = (unit: UnitInstance, facing: UnitFacing): BoardUnitView => ({
  label: unitInstanceLabel(unit),
  facing,
  imageSrc: resolveUnitArtSrc(unit.unitType.name),
  playerSide: unit.playerSide,
  unitTypeId: unit.unitType.id,
  unitTypeVersion: unit.unitType.version,
  unitTypeName: unit.unitType.name,
});

const boardSpaceToCellView = (
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
const projectBoardCells = (
  board: Board | undefined,
): Readonly<Partial<Record<string, BoardCellView>>> => {
  if (!board) {
    const empty: Readonly<Partial<Record<string, BoardCellView>>> = {};
    return empty;
  }

  const cells: Partial<Record<string, BoardCellView>> = {};
  for (const [coordinate, space] of Object.entries(board.board)) {
    if (space !== undefined) {
      cells[coordinate] = boardSpaceToCellView(coordinate, space);
    }
  }
  return cells;
};

export {
  type BoardUnitView,
  type BoardCellView,
  boardSpaceToCellView,
  projectBoardCells,
  unitInstanceLabel,
};
