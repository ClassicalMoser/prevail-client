import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import type { UseQueryResult } from '@tanstack/solid-query';
import { useQuery } from '@tanstack/solid-query';
import { useCommandCards } from '@application/serverPortsContext';
import { commandCardKeys } from '../keys';
import { currentCommandCardsQueryOptions } from './options';

export function useCurrentCommandCardsQuery(): UseQueryResult<Card[], Error> {
  const commandCards = useCommandCards();

  return useQuery(() => currentCommandCardsQueryOptions(commandCards));
}

export function useCommandCardByIdQuery(
  id: Accessor<string | undefined>,
): UseQueryResult<Card, Error> {
  const commandCards = useCommandCards();

  return useQuery(() => {
    const resolvedId = id();

    return {
      queryKey: commandCardKeys.detail(resolvedId ?? ''),
      queryFn: () => {
        if (resolvedId === undefined) {
          throw new Error('Command card id is required');
        }

        return commandCards.getById(resolvedId);
      },
      enabled: resolvedId !== undefined,
    };
  });
}

export function useCommandCardsByIdsQuery(
  ids: Accessor<readonly string[]>,
): UseQueryResult<Card[], Error> {
  const commandCards = useCommandCards();

  return useQuery(() => {
    const resolvedIds = ids();

    return {
      queryKey: commandCardKeys.byIds(resolvedIds),
      queryFn: () => commandCards.getByIds(resolvedIds),
      enabled: resolvedIds.length > 0,
    };
  });
}
