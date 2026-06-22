export const commandCardKeys = {
  lists: () => ['commandCards', 'list'] as const,
  current: () => [...commandCardKeys.lists(), 'current'] as const,
  byIds: (ids: readonly string[]) =>
    [...commandCardKeys.lists(), 'byIds', [...ids].toSorted()] as const,
  detail: (id: string) => ['commandCards', 'detail', id] as const,
};
