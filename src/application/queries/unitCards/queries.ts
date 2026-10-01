import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import { useQuery } from '@tanstack/solid-query';
import type { UseQueryResult } from '@tanstack/solid-query';
import { useUnitCards } from '@application/serverPortsContext';
import { unitCardKeys } from '../keys';

function useAllUnitCardsQuery(): UseQueryResult<CardListItem[], Error> {
  const unitCards = useUnitCards();

  return useQuery(
    (): {
      queryKey: readonly ['unitCards', 'list', 'all'];
      queryFn: () => Promise<CardListItem[]>;
    } => ({
      queryKey: unitCardKeys.all,
      queryFn: (): Promise<CardListItem[]> => unitCards.getAll(),
    }),
  );
}

function useCurrentUnitCardsQuery(): UseQueryResult<UnitType[], Error> {
  const unitCards = useUnitCards();

  return useQuery(
    (): {
      queryKey: readonly ['unitCards', 'list', 'current'];
      queryFn: () => Promise<UnitType[]>;
    } => ({
      queryKey: unitCardKeys.current,
      queryFn: (): Promise<UnitType[]> => unitCards.getCurrent(),
    }),
  );
}

function useUnitCardByIdQuery(
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

function useUnitCardsByIdsQuery(
  ids: Accessor<readonly string[]>,
): UseQueryResult<UnitType[], Error> {
  const unitCards = useUnitCards();

  return useQuery(
    (): {
      queryKey: readonly ['unitCards', 'list', 'byIds', ...string[]];
      queryFn: () => Promise<UnitType[]>;
      enabled: boolean;
    } => ({
      queryKey: unitCardKeys.byIds(ids()),
      queryFn: (): Promise<UnitType[]> => unitCards.getByIds(ids()),
      enabled: ids().length > 0,
    }),
  );
}

export {
  useAllUnitCardsQuery,
  useCurrentUnitCardsQuery,
  useUnitCardByIdQuery,
  useUnitCardsByIdsQuery,
};
