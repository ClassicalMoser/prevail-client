/** Hierarchical query keys for unit card queries and invalidation. */
export const unitCardKeys = {
  all: ['unitCards', 'list', 'all'] as const,
  lists: ['unitCards', 'list'] as const,
  current: ['unitCards', 'list', 'current'] as const,
  byIds: (ids: readonly string[]) =>
    ['unitCards', 'list', 'byIds', ...[...ids].toSorted()] as const,
  detail: (id: string) => ['unitCards', 'detail', id] as const,
};
