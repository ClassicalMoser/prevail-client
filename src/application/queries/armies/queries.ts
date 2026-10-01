import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import { useQuery } from '@tanstack/solid-query';
import type { UseQueryResult } from '@tanstack/solid-query';
import { useArmies } from '@application/serverPortsContext';
import { armyKeys } from '../keys';

function useOwnedArmiesQuery(): UseQueryResult<Army[], Error> {
  const armies = useArmies();

  return useQuery(
    (): {
      queryKey: readonly ['armies', 'list', 'owned'];
      queryFn: () => Promise<Army[]>;
    } => ({
      queryKey: armyKeys.all,
      queryFn: (): Promise<Army[]> => armies.list(),
    }),
  );
}

function useOwnedArmyByIdQuery(
  id: Accessor<string | undefined>,
  options?: { enabled?: Accessor<boolean> },
): UseQueryResult<Army, Error> {
  const armies = useArmies();

  return useQuery(() => {
    const resolvedId = id();
    return {
      queryKey: armyKeys.detail(resolvedId ?? ''),
      queryFn: () => {
        if (resolvedId === undefined) {
          throw new Error('Army id is required.');
        }

        return armies.getById(resolvedId);
      },
      enabled: resolvedId !== undefined && (options?.enabled?.() ?? true),
    };
  });
}

export { useOwnedArmiesQuery, useOwnedArmyByIdQuery };
