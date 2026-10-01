import type {
  Restrictions,
  RoundEffect,
} from '@classicalmoser/prevail-rules/domain';

/** Restrictions used when a card has no round effect yet. */
const emptyRoundEffectRestrictions = (): Restrictions => ({
  inspirationRangeRestriction: -1,
  traitRestrictions: [],
  unitRestrictions: [],
});

/** Default round effect shell for cards loaded without one. */
const emptyRoundEffect = (): RoundEffect => ({
  restrictions: emptyRoundEffectRestrictions(),
  modifiers: [],
});

export { emptyRoundEffectRestrictions, emptyRoundEffect };
