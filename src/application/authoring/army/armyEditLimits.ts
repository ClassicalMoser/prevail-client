import type {
  Army,
  ArmyCompositionRules,
  CommandCard,
  GameModeName,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';
import {
  armyCompositionByMode,
  armyCompositionInitiatives,
} from '@classicalmoser/prevail-rules/domain';

export const maxCommandCardsForMode = (mode: GameModeName): number | null => {
  const per = armyCompositionByMode[mode].cardsPerInitiative;
  if (per === null) {
    return null;
  }
  return per * armyCompositionInitiatives.length;
};

export const maxCopiesForUnit = (unitType: UnitType): number => unitType.limit;

export const canAddUnitType = (army: Army, mode: GameModeName): boolean =>
  army.units.length < armyCompositionByMode[mode].maxUnitTypeCount;

export const canAddCommandCard = (
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
  if (maxTotal !== null && army.commandCards.length >= maxTotal) {
    return false;
  }
  const forInitiative = army.commandCards.filter(
    (c) => c.initiative === card.initiative,
  ).length;
  return forInitiative < rules.cardsPerInitiative;
};

export const compositionRules = (mode: GameModeName): ArmyCompositionRules =>
  armyCompositionByMode[mode];
