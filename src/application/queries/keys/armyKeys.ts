/** Hierarchical query keys for owned army queries and invalidation. */
export const armyKeys = {
  all: ['armies', 'list', 'owned'] as const,
  lists: ['armies', 'list'] as const,
  detail: (id: string) => ['armies', 'detail', id] as const,
};
