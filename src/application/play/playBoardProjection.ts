import type { UnitFacing } from '@classicalmoser/prevail-rules/domain';
import type { BoardCellView } from '@application/gameState';
import { resolveUnitArtSrc } from '@application/gameState';
import type { PlayHighlights, SeatSelection } from './selection';

export type PlayBoardUnitView = BoardCellView['units'][number] & {
  pending?: boolean;
};

export type PlayBoardCellView = Omit<BoardCellView, 'units'> & {
  units: PlayBoardUnitView[];
  highlight?: 'legal' | 'selected';
  facingPicker?: boolean;
  enabledFacings?: readonly UnitFacing[];
};

/** Merge board cells with selection highlights and pending setup placements. */
export function projectPlayBoardCells(args: {
  baseCells: Readonly<Partial<Record<string, BoardCellView>>>;
  highlights: PlayHighlights;
  selection: SeatSelection;
}): Readonly<Partial<Record<string, PlayBoardCellView>>> {
  const { baseCells, highlights: hl, selection: sel } = args;
  const merged: Partial<Record<string, PlayBoardCellView>> = {};

  for (const [coord, view] of Object.entries(baseCells)) {
    if (view === undefined) {
      continue;
    }
    merged[coord] = {
      ...view,
      highlight: hl.cells[coord],
      facingPicker: hl.facingPickerCells.has(coord),
      enabledFacings: hl.facingPickerFacings[coord],
    };
  }

  for (const [coord, highlight] of Object.entries(hl.cells)) {
    if (merged[coord] === undefined) {
      merged[coord] = {
        coordinate: coord,
        commanders: [],
        units: [],
        highlight,
        facingPicker: hl.facingPickerCells.has(coord),
        enabledFacings: hl.facingPickerFacings[coord],
      };
    }
  }

  if (sel.kind === 'setup') {
    for (const placement of sel.placements) {
      const coord = placement.placement.coordinate;
      const existing = merged[coord];
      const pendingUnit: PlayBoardUnitView = {
        label: `${placement.unit.unitType.name} (${placement.unit.playerSide} #${placement.unit.instanceNumber})`,
        facing: placement.placement.facing,
        imageSrc: resolveUnitArtSrc(placement.unit.unitType.name),
        playerSide: placement.unit.playerSide,
        unitTypeId: placement.unit.unitType.id,
        unitTypeVersion: placement.unit.unitType.version,
        unitTypeName: placement.unit.unitType.name,
        pending: true,
      };
      if (existing === undefined) {
        merged[coord] = {
          coordinate: coord,
          commanders: [],
          units: [pendingUnit],
          highlight: hl.cells[coord] ?? 'selected',
          facingPicker: false,
        };
      } else {
        merged[coord] = {
          ...existing,
          highlight: hl.cells[coord] ?? 'selected',
          facingPicker: false,
          units: [
            ...existing.units.filter((unit) => unit.pending !== true),
            pendingUnit,
          ],
        };
      }
    }
  }

  return merged;
}
