import type { UnitInstance } from '@classicalmoser/prevail-rules/domain';

export const unitKey = (unit: UnitInstance): string =>
  `${unit.playerSide}:${unit.unitType.id}:${unit.instanceNumber}`;
