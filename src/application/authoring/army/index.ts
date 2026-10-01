import { isGameModeName, useArmyEditor } from './useArmyEditor';
import type {
  ArmyBudgetProjection,
  ArmyDraft,
  UseArmyEditorResult,
} from './useArmyEditor';
import { validateArmyForMode, validateArmyShape } from './validateArmyDraft';
import type { ArmyDraftValidationResult } from './validateArmyDraft';
import {
  canAddCommandCard,
  canAddUnitType,
  compositionRules,
  maxCommandCardsForMode,
  maxCopiesForUnit,
} from './armyEditLimits';

export {
  type ArmyBudgetProjection,
  type ArmyDraft,
  type UseArmyEditorResult,
  isGameModeName,
  useArmyEditor,
  type ArmyDraftValidationResult,
  validateArmyForMode,
  validateArmyShape,
  canAddCommandCard,
  canAddUnitType,
  compositionRules,
  maxCommandCardsForMode,
  maxCopiesForUnit,
};
