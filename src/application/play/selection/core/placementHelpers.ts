import type {
  Coordinate,
  UnitFacing,
  UnitPlacement,
} from '@classicalmoser/prevail-rules/domain';

export function placementForCoordinate(
  destinations: UnitPlacement[],
  coordinate: Coordinate,
): UnitPlacement | undefined {
  return destinations.find((d) => d.coordinate === coordinate);
}

export function facingsForCoordinate(
  destinations: UnitPlacement[],
  coordinate: Coordinate,
): UnitFacing[] {
  const seen = new Set<UnitFacing>();
  const facings: UnitFacing[] = [];
  for (const destination of destinations) {
    if (destination.coordinate !== coordinate || seen.has(destination.facing)) {
      continue;
    }
    seen.add(destination.facing);
    facings.push(destination.facing);
  }
  return facings;
}

export function placementForCoordinateAndFacing(
  destinations: UnitPlacement[],
  coordinate: Coordinate,
  facing: UnitFacing,
): UnitPlacement | undefined {
  return destinations.find(
    (d) => d.coordinate === coordinate && d.facing === facing,
  );
}
