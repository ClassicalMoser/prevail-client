import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import type { UseQueryResult } from '@tanstack/solid-query';
import { useQuery } from '@tanstack/solid-query';
import { useArmies } from '@application/serverPortsContext';
import { armyKeys } from '../keys';

export function useOwnedArmiesQuery(): UseQueryResult<Army[], Error> {
  const armies = useArmies();

  return useQuery(() => ({
    queryKey: armyKeys.all,
    queryFn: () => armies.list(),
  }));
}

export function useOwnedArmyByIdQuery(
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
