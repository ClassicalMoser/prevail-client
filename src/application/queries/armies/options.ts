import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { Armies } from '@ports';
import type { QueryOptions } from '@tanstack/solid-query';
import { queryOptions } from '@tanstack/solid-query';
import { armyKeys } from '../keys';

export function ownedArmiesQueryOptions(
  armies: Armies,
): QueryOptions<Army[], Error, Army[], typeof armyKeys.all> {
  return queryOptions({
    queryKey: armyKeys.all,
    queryFn: () => armies.list(),
  });
}

export function ownedArmyByIdQueryOptions(
  armies: Armies,
  id: string,
): QueryOptions<Army, Error, Army, ReturnType<typeof armyKeys.detail>> {
  return queryOptions({
    queryKey: armyKeys.detail(id),
    queryFn: () => armies.getById(id),
  });
}
