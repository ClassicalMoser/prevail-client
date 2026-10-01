import {
  armyCompositionByMode,
  armyCompositionInitiatives,
} from '@classicalmoser/prevail-rules/domain';
import type {
  Army,
  ArmyCompositionRules,
  CommandCard,
  GameModeName,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';

/**
 * Total command cards a mode allows, or undefined when the mode has no cap.
 * `cardsPerInitiative` uses null for "uncapped". That null stays on the rules
 * object; this function answers the client with undefined.
 */
const maxCommandCardsForMode = (mode: GameModeName): number | undefined => {
  const cardsPerInitiative = armyCompositionByMode[mode].cardsPerInitiative;
  // Null on the composition rule means the mode does not limit the deck.
  if (cardsPerInitiative === null) {
    return undefined;
  }
  return cardsPerInitiative * armyCompositionInitiatives.length;
};

const maxCopiesForUnit = (unitType: UnitType): number => unitType.limit;

const canAddUnitType = (army: Army, mode: GameModeName): boolean =>
  army.units.length < armyCompositionByMode[mode].maxUnitTypeCount;

const canAddCommandCard = (
  army: Army,
  mode: GameModeName,
  card: CommandCard,
): boolean => {
  if (army.commandCards.some((c) => c.id === card.id)) {
    return false;
  }
  const rules = armyCompositionByMode[mode];
  if (rules.cardsPerInitiative === null) {
    return true;
  }
  const maxTotal = maxCommandCardsForMode(mode);
  if (maxTotal !== undefined && army.commandCards.length >= maxTotal) {
    return false;
  }
  const forInitiative = army.commandCards.filter(
    (c) => c.initiative === card.initiative,
  ).length;
  return forInitiative < rules.cardsPerInitiative;
};

const compositionRules = (mode: GameModeName): ArmyCompositionRules =>
  armyCompositionByMode[mode];

export {
  maxCommandCardsForMode,
  maxCopiesForUnit,
  canAddUnitType,
  canAddCommandCard,
  compositionRules,
};
