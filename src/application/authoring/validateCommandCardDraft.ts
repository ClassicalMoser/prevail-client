import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { commandCardSchema } from '@classicalmoser/prevail-rules/domain';

export type CommandCardDraftValidationResult =
  | { success: true; data: CommandCard }
  | { success: false; messages: string[] };

const formatIssuePath = (path: PropertyKey[]): string =>
  path.map(String).join('.');

/** Validates a command card draft against the domain schema before publish/preview. */
export function validateCommandCardDraft(
  card: CommandCard,
): CommandCardDraftValidationResult {
  const result = commandCardSchema.safeParse(card);

  if (result.success) {
    return { success: true, data: result.data };
  }

  console.error('[command-card-draft] schema parse failed', {
    cardId: card.id,
    cardName: card.name,
    cardVersion: card.version,
    modifiers: card.modifiers,
    modifiersType: typeof card.modifiers,
    modifiersIsArray: Array.isArray(card.modifiers),
    modifiers0: Array.isArray(card.modifiers) ? card.modifiers[0] : undefined,
    modifiers0Type: Array.isArray(card.modifiers)
      ? typeof card.modifiers[0]
      : undefined,
    issues: result.error.issues,
  });

  return {
    success: false,
    messages: result.error.issues.map((issue) => {
      const path = formatIssuePath(issue.path);
      return path.length > 0 ? `${path}: ${issue.message}` : issue.message;
    }),
  };
}
