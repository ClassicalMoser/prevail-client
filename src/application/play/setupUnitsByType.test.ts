import type { UnitInstance } from '@classicalmoser/prevail-rules/domain';
import {
  createUnitInstance,
  tempUnits,
} from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import { setupUnitsByType } from './setupUnitsByType';

const equites = (n: number): UnitInstance =>
  createUnitInstance('black', tempUnits[0], n);
const velites = (n: number): UnitInstance =>
  createUnitInstance('black', tempUnits[1], n);

describe(setupUnitsByType, () => {
  it('groups by unit type id in first-seen order', () => {
    const units = [equites(1), equites(2), velites(1), equites(3)];
    const groups = setupUnitsByType(units, []);

    expect(groups.map((g) => g.typeId)).toStrictEqual([
      equites(1).unitType.id,
      velites(1).unitType.id,
    ]);
    expect(groups[0]?.remaining).toBe(3);
    expect(groups[0]?.total).toBe(3);
    expect(groups[1]?.remaining).toBe(1);
  });

  it('subtracts placed instances from remaining', () => {
    const units = [equites(1), equites(2), velites(1)];
    const groups = setupUnitsByType(units, [equites(1), equites(2)]);

    expect(groups[0]?.remaining).toBe(0);
    expect(groups[1]?.remaining).toBe(1);
  });

  it('picks the first unplaced instance, else the first placed', () => {
    const units = [equites(1), equites(2), velites(1)];
    const withRemaining = setupUnitsByType(units, [equites(1)]);
    expect(withRemaining[0]?.pick.instanceNumber).toBe(2);

    const allPlaced = setupUnitsByType(units, [
      equites(1),
      equites(2),
      velites(1),
    ]);
    expect(allPlaced[0]?.pick.instanceNumber).toBe(1);
  });
});
