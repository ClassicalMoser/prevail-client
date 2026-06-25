import type {
  Restrictions,
  RoundEffect,
} from '@classicalmoser/prevail-rules/domain';

/** Restrictions used when a card has no round effect yet. */
export const emptyRoundEffectRestrictions = (): Restrictions => ({
  inspirationRangeRestriction: -1,
  traitRestrictions: [],
  unitRestrictions: [],
});

/** Default round effect shell for cards loaded without one. */
export const emptyRoundEffect = (): RoundEffect => ({
  restrictions: emptyRoundEffectRestrictions(),
  modifiers: [],
});
