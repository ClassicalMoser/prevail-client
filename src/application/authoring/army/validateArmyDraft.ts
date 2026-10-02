import {
  armySchema,
  armySchemaForMode,
} from '@classicalmoser/prevail-rules/domain';
import type { Army, GameModeName } from '@classicalmoser/prevail-rules/domain';
import { draftValidationMessages } from '../draftValidationMessages';

type ArmyDraftValidationResult =
  | { success: true; data: Army }
  | { success: false; messages: string[] };

/** Shape-only validation — use on load / reset. */
function validateArmyShape(army: Army): ArmyDraftValidationResult {
  const result = armySchema.safeParse(army);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const messages = draftValidationMessages(result.error.issues);
  return { success: false, messages };
}

/** Mode composition validation — use while editing with a prespecified mode. */
function validateArmyForMode(
  army: Army,
  mode: GameModeName,
): ArmyDraftValidationResult {
  const result = armySchemaForMode(mode).safeParse(army);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const messages = draftValidationMessages(result.error.issues);
  return { success: false, messages };
}

export {
  type ArmyDraftValidationResult,
  validateArmyShape,
  validateArmyForMode,
};
