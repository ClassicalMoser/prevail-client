/* oxlint-disable typescript/explicit-module-boundary-types -- queryOptions return types are inferred for prefetch callers */
import type { CommandCards } from '@ports';
import { queryOptions } from '@tanstack/solid-query';
import { commandCardKeys } from '../keys';

export function currentCommandCardsQueryOptions(commandCards: CommandCards) {
  return queryOptions({
    queryKey: commandCardKeys.current(),
    queryFn: () => commandCards.getCurrent(),
  });
}

export function commandCardByIdQueryOptions(
  commandCards: CommandCards,
  id: string,
) {
  return queryOptions({
    queryKey: commandCardKeys.detail(id),
    queryFn: () => commandCards.getById(id),
  });
}

export function commandCardsByIdsQueryOptions(
  commandCards: CommandCards,
  ids: readonly string[],
) {
  return queryOptions({
    queryKey: commandCardKeys.byIds(ids),
    queryFn: () => commandCards.getByIds(ids),
  });
}
