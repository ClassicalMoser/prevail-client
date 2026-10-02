import {
  tempCommandCards,
  tempUnits,
  whiteTinyStarterArmy,
} from '@classicalmoser/prevail-rules/domain';
import type { Army } from '@classicalmoser/prevail-rules/domain';
import { describe, expect, it } from 'vite-plus/test';
import {
  canAddCommandCard,
  canAddUnitType,
  maxCommandCardsForMode,
  maxCopiesForUnit,
} from './armyEditLimits';

describe('army edit limits', () => {
  it('reports the max copies from the unit type limit', () => {
    expect.hasAssertions();
    const unit = tempUnits[0];
    const max = maxCopiesForUnit(unit);

    expect(max).toBe(unit.limit);
  }, 1000);

  it('allows another unit type while under the mode cap', () => {
    expect.hasAssertions();
    const army: Army = {
      ...whiteTinyStarterArmy,
      units: [],
    };
    const allowed = canAddUnitType(army, 'mini');

    expect(allowed).toBe(true);
  }, 1000);

  it('rejects a command card already in the army', () => {
    expect.hasAssertions();
    const card = tempCommandCards[0];
    const army: Army = {
      ...whiteTinyStarterArmy,
      commandCards: [card],
    };
    const allowed = canAddCommandCard(army, 'mini', card);

    expect(allowed).toBe(false);
  }, 1000);

  it('returns a total command-card cap for mini', () => {
    expect.hasAssertions();
    const max = maxCommandCardsForMode('mini');

    expect(max).toBeTypeOf('number');
  }, 1000);
});
