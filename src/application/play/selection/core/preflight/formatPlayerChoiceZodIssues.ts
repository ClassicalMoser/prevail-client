/** Format Zod issues for seat choiceRejected / local preflight. */
export function formatPlayerChoiceZodIssues(
  issues: readonly { path: PropertyKey[]; message: string }[],
): string {
  return issues
    .slice(0, 5)
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}
