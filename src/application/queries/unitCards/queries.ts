import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import type { UseQueryResult } from '@tanstack/solid-query';
import { useQuery } from '@tanstack/solid-query';
import { useUnitCards } from '@application/serverPortsContext';
import { unitCardKeys } from '../keys';
import { currentUnitCardsQueryOptions } from './options';

export function useCurrentUnitCardsQuery(): UseQueryResult<UnitType[], Error> {
  const unitCards = useUnitCards();

  return useQuery(() => currentUnitCardsQueryOptions(unitCards));
}

export function useUnitCardByIdQuery(
  id: Accessor<string | undefined>,
): UseQueryResult<UnitType, Error> {
  const unitCards = useUnitCards();

  return useQuery(() => {
    const resolvedId = id();

    return {
      queryKey: unitCardKeys.detail(resolvedId ?? ''),
      queryFn: () => {
        if (resolvedId === undefined) {
          throw new Error('Unit card id is required');
        }

        return unitCards.getById(resolvedId);
      },
      enabled: resolvedId !== undefined,
    };
  });
}

export function useUnitCardsByIdsQuery(
  ids: Accessor<readonly string[]>,
): UseQueryResult<UnitType[], Error> {
  const unitCards = useUnitCards();

  return useQuery(() => {
    const resolvedIds = ids();

    return {
      queryKey: unitCardKeys.byIds(resolvedIds),
      queryFn: () => unitCards.getByIds(resolvedIds),
      enabled: resolvedIds.length > 0,
    };
  });
}
