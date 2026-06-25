import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { UnitCards } from '@ports';
import type { QueryOptions } from '@tanstack/solid-query';
import { queryOptions } from '@tanstack/solid-query';
import { unitCardKeys } from '../keys';

export function allUnitCardsQueryOptions(
  unitCards: UnitCards,
): QueryOptions<
  CardListItem[],
  Error,
  CardListItem[],
  typeof unitCardKeys.all
> {
  return queryOptions({
    queryKey: unitCardKeys.all,
    queryFn: () => unitCards.getAll(),
  });
}

export function currentUnitCardsQueryOptions(
  unitCards: UnitCards,
): QueryOptions<UnitType[], Error, UnitType[], typeof unitCardKeys.current> {
  return queryOptions({
    queryKey: unitCardKeys.current,
    queryFn: () => unitCards.getCurrent(),
  });
}

export function unitCardByIdQueryOptions(
  unitCards: UnitCards,
  id: string,
): QueryOptions<
  UnitType,
  Error,
  UnitType,
  ReturnType<typeof unitCardKeys.detail>
> {
  return queryOptions({
    queryKey: unitCardKeys.detail(id),
    queryFn: () => unitCards.getById(id),
  });
}

export function unitCardsByIdsQueryOptions(
  unitCards: UnitCards,
  ids: readonly string[],
): QueryOptions<
  UnitType[],
  Error,
  UnitType[],
  ReturnType<typeof unitCardKeys.byIds>
> {
  return queryOptions({
    queryKey: unitCardKeys.byIds(ids),
    queryFn: () => unitCards.getByIds(ids),
  });
}
