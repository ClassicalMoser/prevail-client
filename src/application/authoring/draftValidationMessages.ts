/**
 * Player-facing draft validation lines from Zod issues.
 * Schema paths stay out of the copy — only the message reaches the editor.
 */
function draftValidationMessages(
  issues: readonly { path: PropertyKey[]; message: string }[],
): string[] {
  const messages = issues.map((issue) => issue.message);
  return messages;
}

export { draftValidationMessages };
