import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import type { UseQueryResult } from '@tanstack/solid-query';
import { useQuery } from '@tanstack/solid-query';
import { useCommandCards } from '@application/serverPortsContext';
import { commandCardKeys } from '../keys';

export function useAllCommandCardsQuery(): UseQueryResult<
  CardListItem[],
  Error
> {
  const commandCards = useCommandCards();

  return useQuery(() => ({
    queryKey: commandCardKeys.all,
    queryFn: () => commandCards.getAll(),
  }));
}

export function useCurrentCommandCardsQuery(): UseQueryResult<Card[], Error> {
  const commandCards = useCommandCards();

  return useQuery(() => ({
    queryKey: commandCardKeys.current,
    queryFn: () => commandCards.getCurrent(),
  }));
}

export function useCommandCardByIdQuery(
  id: Accessor<string | undefined>,
  options?: { enabled?: Accessor<boolean> },
): UseQueryResult<Card, Error> {
  const commandCards = useCommandCards();

  return useQuery(() => {
    const resolvedId = id();
    return {
      queryKey: commandCardKeys.detail(resolvedId ?? ''),
      queryFn: () => {
        if (resolvedId === undefined) {
          throw new Error('Command card id is required.');
        }

        return commandCards.getById(resolvedId);
      },
      enabled: resolvedId !== undefined && (options?.enabled?.() ?? true),
    };
  });
}

export function useCommandCardsByIdsQuery(
  ids: Accessor<readonly string[]>,
): UseQueryResult<Card[], Error> {
  const commandCards = useCommandCards();

  return useQuery(() => ({
    queryKey: commandCardKeys.byIds(ids()),
    queryFn: () => commandCards.getByIds(ids()),
    enabled: ids().length > 0,
  }));
}
