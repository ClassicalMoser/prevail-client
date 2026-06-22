export const unitCardKeys = {
  lists: () => ['unitCards', 'list'] as const,
  current: () => [...unitCardKeys.lists(), 'current'] as const,
  byIds: (ids: readonly string[]) =>
    [...unitCardKeys.lists(), 'byIds', [...ids].toSorted()] as const,
  detail: (id: string) => ['unitCards', 'detail', id] as const,
};
