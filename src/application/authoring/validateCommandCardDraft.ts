import { commandCardSchema } from '@classicalmoser/prevail-rules/domain';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { draftValidationMessages } from './draftValidationMessages';

type CommandCardDraftValidationResult =
  | { success: true; data: CommandCard }
  | { success: false; messages: string[] };

/** Validates a command card draft against the domain schema before publish/preview. */
function validateCommandCardDraft(
  card: CommandCard,
): CommandCardDraftValidationResult {
  const result = commandCardSchema.safeParse(card);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const messages = draftValidationMessages(result.error.issues);
  return { success: false, messages };
}

export { type CommandCardDraftValidationResult, validateCommandCardDraft };
