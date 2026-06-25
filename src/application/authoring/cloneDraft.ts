function toPlainValue<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => toPlainValue(entry)) as T;
  }

  const plain: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    plain[key] = toPlainValue(entry);
  }

  return plain as T;
}

/** Deep-clone query data for local draft state, stripping TanStack Query proxies. */
export function cloneDraft<T>(value: T): T {
  return structuredClone(toPlainValue(value));
}
