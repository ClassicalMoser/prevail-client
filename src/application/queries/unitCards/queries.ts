import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import type { UseQueryResult } from '@tanstack/solid-query';
import { useQuery } from '@tanstack/solid-query';
import { useUnitCards } from '@application/serverPortsContext';
import { unitCardKeys } from '../keys';

export function useAllUnitCardsQuery(): UseQueryResult<CardListItem[], Error> {
  const unitCards = useUnitCards();

  return useQuery(() => ({
    queryKey: unitCardKeys.all,
    queryFn: () => unitCards.getAll(),
  }));
}

export function useCurrentUnitCardsQuery(): UseQueryResult<UnitType[], Error> {
  const unitCards = useUnitCards();

  return useQuery(() => ({
    queryKey: unitCardKeys.current,
    queryFn: () => unitCards.getCurrent(),
  }));
}

export function useUnitCardByIdQuery(
  id: Accessor<string | undefined>,
  options?: { enabled?: Accessor<boolean> },
): UseQueryResult<UnitType, Error> {
  const unitCards = useUnitCards();

  return useQuery(() => {
    const resolvedId = id();
    return {
      queryKey: unitCardKeys.detail(resolvedId ?? ''),
      queryFn: () => {
        if (resolvedId === undefined) {
          throw new Error('Unit card id is required.');
        }

        return unitCards.getById(resolvedId);
      },
      enabled: resolvedId !== undefined && (options?.enabled?.() ?? true),
    };
  });
}

export function useUnitCardsByIdsQuery(
  ids: Accessor<readonly string[]>,
): UseQueryResult<UnitType[], Error> {
  const unitCards = useUnitCards();

  return useQuery(() => ({
    queryKey: unitCardKeys.byIds(ids()),
    queryFn: () => unitCards.getByIds(ids()),
    enabled: ids().length > 0,
  }));
}
