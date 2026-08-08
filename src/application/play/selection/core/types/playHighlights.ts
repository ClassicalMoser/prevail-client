import type { UnitFacing } from '@classicalmoser/prevail-rules/domain';

export type CellHighlight = 'legal' | 'selected';

export interface PlayHighlights {
  cells: Readonly<Partial<Record<string, CellHighlight>>>;
  /** Cells that should show the eight-direction facing picker. */
  facingPickerCells: ReadonlySet<string>;
  /** Allowed facings per picker cell (omit / empty = all eight). */
  facingPickerFacings: Readonly<Partial<Record<string, readonly UnitFacing[]>>>;
  /** Command card ids highlighted as legal / selected. */
  cardIds: Readonly<Partial<Record<string, CellHighlight>>>;
}
