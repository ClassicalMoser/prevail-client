import type { PlayerChoiceEvent } from '@classicalmoser/prevail-rules/domain';
import { playerChoiceEventSchema } from '@classicalmoser/prevail-rules/domain';
import { cloneDraft } from '@application/authoring';
import { formatPlayerChoiceZodIssues } from './formatPlayerChoiceZodIssues';

/**
 * Validate a choice against the wire schema before send. Returns the parsed
 * plain event, or an errorReason suitable for choiceRejected.
 */
export function preflightPlayerChoice(
  choice: PlayerChoiceEvent,
):
  | { ok: true; choice: PlayerChoiceEvent }
  | { ok: false; errorReason: string } {
  const parsed = playerChoiceEventSchema.safeParse(cloneDraft(choice));
  if (!parsed.success) {
    return {
      ok: false,
      errorReason: `Invalid playerChoice (${formatPlayerChoiceZodIssues(parsed.error.issues)})`,
    };
  }
  return { ok: true, choice: parsed.data };
}
