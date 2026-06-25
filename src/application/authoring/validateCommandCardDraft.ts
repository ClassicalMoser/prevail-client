import type { Card } from '@classicalmoser/prevail-rules/domain';
import { cardSchema } from '@classicalmoser/prevail-rules/domain';

export type CommandCardDraftValidationResult =
  | { success: true; data: Card }
  | { success: false; messages: string[] };

const formatIssuePath = (path: PropertyKey[]): string =>
  path.map(String).join('.');

/** Validates a command card draft against the domain schema before publish/preview. */
export function validateCommandCardDraft(
  card: Card,
): CommandCardDraftValidationResult {
  const result = cardSchema.safeParse(card);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    messages: result.error.issues.map((issue) => {
      const path = formatIssuePath(issue.path);
      return path.length > 0 ? `${path}: ${issue.message}` : issue.message;
    }),
  };
}
