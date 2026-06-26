import type {
  Card,
  Restrictions,
  RoundEffect,
  UnitStats,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';

const INITIAL_VERSION = '0.0.1';

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

const defaultUnitStats: UnitStats = {
  attack: 3,
  range: 0,
  speed: 2,
  flexibility: 2,
  retreat: 3,
  reverse: 4,
  rout: 5,
};

/** Default unit card body for authoring the first version of an empty card. */
export const defaultUnitCardDraft = (id: string): UnitType => ({
  id,
  version: INITIAL_VERSION,
  name: '',
  imageUrl: null,
  traits: [],
  stats: defaultUnitStats,
  cost: 10,
  limit: 4,
  routPenalty: 0,
});
