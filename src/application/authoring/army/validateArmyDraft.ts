import type { Army, GameModeName } from '@classicalmoser/prevail-rules/domain';
import {
  armySchema,
  armySchemaForMode,
} from '@classicalmoser/prevail-rules/domain';

export type ArmyDraftValidationResult =
  | { success: true; data: Army }
  | { success: false; messages: string[] };

const formatIssuePath = (path: PropertyKey[]): string =>
  path.map(String).join('.');

const messagesFromIssues = (
  issues: { path: PropertyKey[]; message: string }[],
): string[] =>
  issues.map((issue) => {
    const path = formatIssuePath(issue.path);
    return path.length > 0 ? `${path}: ${issue.message}` : issue.message;
  });

/** Shape-only validation — use on load / reset. */
export function validateArmyShape(army: Army): ArmyDraftValidationResult {
  const result = armySchema.safeParse(army);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, messages: messagesFromIssues(result.error.issues) };
}

/** Mode composition validation — use while editing with a prespecified mode. */
export function validateArmyForMode(
  army: Army,
  mode: GameModeName,
): ArmyDraftValidationResult {
  const result = armySchemaForMode(mode).safeParse(army);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, messages: messagesFromIssues(result.error.issues) };
}
