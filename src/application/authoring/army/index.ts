export type {
  ArmyBudgetProjection,
  ArmyDraft,
  UseArmyEditorResult,
} from './useArmyEditor';
export { isGameModeName, useArmyEditor } from './useArmyEditor';
export type { ArmyDraftValidationResult } from './validateArmyDraft';
export { validateArmyForMode, validateArmyShape } from './validateArmyDraft';
export {
  canAddCommandCard,
  canAddUnitType,
  compositionRules,
  maxCommandCardsForMode,
  maxCopiesForUnit,
} from './armyEditLimits';
