/* oxlint-disable typescript/explicit-module-boundary-types -- queryOptions return types are inferred for prefetch callers */
import type { UnitCards } from '@ports';
import { queryOptions } from '@tanstack/solid-query';
import { unitCardKeys } from '../keys';

export function currentUnitCardsQueryOptions(unitCards: UnitCards) {
  return queryOptions({
    queryKey: unitCardKeys.current(),
    queryFn: () => unitCards.getCurrent(),
  });
}

export function unitCardByIdQueryOptions(unitCards: UnitCards, id: string) {
  return queryOptions({
    queryKey: unitCardKeys.detail(id),
    queryFn: () => unitCards.getById(id),
  });
}

export function unitCardsByIdsQueryOptions(
  unitCards: UnitCards,
  ids: readonly string[],
) {
  return queryOptions({
    queryKey: unitCardKeys.byIds(ids),
    queryFn: () => unitCards.getByIds(ids),
  });
}
