import type { UnitWithPlacement } from '@classicalmoser/prevail-rules/domain';
import { isSameUnitInstance } from '@classicalmoser/prevail-rules/domain';

/**
 * Contiguous start→end segment along flanking geometry. Order matters:
 * validators treat `units[0]` as the inspired start.
 */
export function lineUnitsFromStartToEnd(
  segment: readonly UnitWithPlacement[],
  start: UnitWithPlacement,
  end: UnitWithPlacement,
): UnitWithPlacement[] | undefined {
  const startIndex = segment.findIndex(
    (uwp) => isSameUnitInstance(uwp.unit, start.unit).result,
  );
  const endIndex = segment.findIndex(
    (uwp) => isSameUnitInstance(uwp.unit, end.unit).result,
  );
  if (startIndex === -1 || endIndex === -1) {
    return undefined;
  }
  if (startIndex <= endIndex) {
    return segment.slice(startIndex, endIndex + 1);
  }
  return segment.slice(endIndex, startIndex + 1).toReversed();
}
