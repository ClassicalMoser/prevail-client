interface SchemaParseIssue {
  code: string;
  path: PropertyKey[];
  message: string;
}

interface SafeParseSchema {
  safeParse(input: unknown): {
    success: boolean;
    error?: { issues: SchemaParseIssue[] };
  };
}

const valueAtPath = (value: unknown, path: PropertyKey[]): unknown => {
  let current: unknown = value;

  for (const segment of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }

    if (Array.isArray(current)) {
      if (typeof segment !== 'number') {
        return undefined;
      }

      current = current[segment];
      continue;
    }

    if (typeof segment === 'string') {
      current = (current as Record<string, unknown>)[segment];
    }
  }

  return current;
};

/** Logs zod parse failures with the received value at each issue path. */
export function logSchemaParseFailure(
  label: string,
  schema: SafeParseSchema,
  input: unknown,
): void {
  const result = schema.safeParse(input);
  if (result.success || result.error === undefined) {
    return;
  }

  const { issues } = result.error;

  const issueDetails = issues.map((issue) => {
    const received = valueAtPath(input, issue.path);

    return {
      code: issue.code,
      path: issue.path,
      message: issue.message,
      received,
      receivedType: typeof received,
      receivedJson: JSON.stringify(received),
    };
  });

  const payloadSummary =
    Array.isArray(input) ?
      input.map((entry, index) => {
        if (typeof entry !== 'object' || entry === null) {
          return { index, entryType: typeof entry, entry };
        }

        const card = entry as {
          id?: unknown;
          name?: unknown;
          modifiers?: unknown;
        };

        return {
          index,
          id: card.id,
          name: card.name,
          modifiers: card.modifiers,
          modifiersType: typeof card.modifiers,
          modifiersIsArray: Array.isArray(card.modifiers),
          modifiers0: Array.isArray(card.modifiers) ? card.modifiers[0] : undefined,
          modifiers0Type:
            Array.isArray(card.modifiers) ? typeof card.modifiers[0] : undefined,
          modifiers0Json:
            Array.isArray(card.modifiers) ?
              JSON.stringify(card.modifiers[0])
            : undefined,
        };
      })
    : {
        inputType: typeof input,
        inputIsArray: Array.isArray(input),
        inputJson:
          typeof input === 'string' ?
            input
          : JSON.stringify(input)?.slice(0, 2000),
      };

  console.error(`[schema-parse] ${label} failed`, {
    issueCount: issues.length,
    issues: issueDetails,
    payloadSummary,
  });
}
