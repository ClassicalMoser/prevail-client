/** Deep-clone query data for local draft state. JSON round-trip strips TanStack Query proxies. */
export function cloneDraft<T>(value: T): T {
  // oxlint-disable-next-line unicorn/prefer-structured-clone -- plain object required before clone
  const plain = JSON.parse(JSON.stringify(value)) as T;
  return structuredClone(plain);
}
