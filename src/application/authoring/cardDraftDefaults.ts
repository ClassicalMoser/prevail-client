import type {
  Card,
  Restrictions,
  RoundEffect,
  UnitStats,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';
import { unitStatNames } from '@classicalmoser/prevail-rules/domain';

const INITIAL_VERSION = '1.0.0';

const emptyRestrictions = (): Restrictions => ({
  inspirationRangeRestriction: -1,
  traitRestrictions: [],
  unitRestrictions: [],
});

const emptyRoundEffect = (): RoundEffect => ({
  restrictions: emptyRestrictions(),
  modifiers: [],
});

/** Default command card body for authoring the first version of an empty card. */
export const defaultCommandCardDraft = (id: string): Card => ({
  id,
  version: INITIAL_VERSION,
  name: '',
  initiative: 1,
  modifiers: [],
  command: {
    size: 'units',
    type: 'movement',
    number: 1,
    restrictions: emptyRestrictions(),
    modifiers: [],
  },
  roundEffect: emptyRoundEffect(),
  unitSupport: { supportType: 'generic', count: 1 },
});

const defaultUnitStats = (): UnitStats =>
  Object.fromEntries(
    unitStatNames.map((statName) => [statName, 1]),
  ) as UnitStats;

/** Default unit card body for authoring the first version of an empty card. */
export const defaultUnitCardDraft = (id: string): UnitType => ({
  id,
  version: INITIAL_VERSION,
  name: '',
  traits: [],
  stats: defaultUnitStats(),
  cost: 10,
  limit: 4,
  routPenalty: 0,
});
