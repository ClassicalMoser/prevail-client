import type { UnitFacing } from '@classicalmoser/prevail-rules/domain';
import type { CellHighlight, PlayHighlights } from './types';

interface HighlightDraft {
  cells: Partial<Record<string, CellHighlight>>;
  cardIds: Partial<Record<string, CellHighlight>>;
  facingPickerCells: Set<string>;
  facingPickerFacings: Partial<Record<string, readonly UnitFacing[]>>;
}

function emptyHighlightDraft(): HighlightDraft {
  return {
    cells: {},
    cardIds: {},
    facingPickerCells: new Set(),
    facingPickerFacings: {},
  };
}

function finalizeHighlights(draft: HighlightDraft): PlayHighlights {
  return {
    cells: draft.cells,
    cardIds: draft.cardIds,
    facingPickerCells: draft.facingPickerCells,
    facingPickerFacings: draft.facingPickerFacings,
  };
}

export { type HighlightDraft, emptyHighlightDraft, finalizeHighlights };
