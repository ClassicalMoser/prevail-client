/** Hierarchical query keys for command card queries and invalidation. */
export const commandCardKeys = {
  all: ['commandCards', 'list', 'all'] as const,
  lists: ['commandCards', 'list'] as const,
  current: ['commandCards', 'list', 'current'] as const,
  byIds: (ids: readonly string[]) =>
    ['commandCards', 'list', 'byIds', ...[...ids].toSorted()] as const,
  detail: (id: string) => ['commandCards', 'detail', id] as const,
};
