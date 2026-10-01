import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import { useQuery } from '@tanstack/solid-query';
import type { UseQueryResult } from '@tanstack/solid-query';
import { useCommandCards } from '@application/serverPortsContext';
import { commandCardKeys } from '../keys';

function useAllCommandCardsQuery(): UseQueryResult<CardListItem[], Error> {
  const commandCards = useCommandCards();

  return useQuery(
    (): {
      queryKey: readonly ['commandCards', 'list', 'all'];
      queryFn: () => Promise<CardListItem[]>;
    } => ({
      queryKey: commandCardKeys.all,
      queryFn: (): Promise<CardListItem[]> => commandCards.getAll(),
    }),
  );
}

function useCurrentCommandCardsQuery(): UseQueryResult<CommandCard[], Error> {
  const commandCards = useCommandCards();

  return useQuery(
    (): {
      queryKey: readonly ['commandCards', 'list', 'current'];
      queryFn: () => Promise<CommandCard[]>;
    } => ({
      queryKey: commandCardKeys.current,
      queryFn: (): Promise<CommandCard[]> => commandCards.getCurrent(),
    }),
  );
}

function useCommandCardByIdQuery(
  id: Accessor<string | undefined>,
  options?: { enabled?: Accessor<boolean> },
): UseQueryResult<CommandCard, Error> {
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

function useCommandCardsByIdsQuery(
  ids: Accessor<readonly string[]>,
): UseQueryResult<CommandCard[], Error> {
  const commandCards = useCommandCards();

  return useQuery(
    (): {
      queryKey: readonly ['commandCards', 'list', 'byIds', ...string[]];
      queryFn: () => Promise<CommandCard[]>;
      enabled: boolean;
    } => ({
      queryKey: commandCardKeys.byIds(ids()),
      queryFn: (): Promise<CommandCard[]> => commandCards.getByIds(ids()),
      enabled: ids().length > 0,
    }),
  );
}

export {
  useAllCommandCardsQuery,
  useCurrentCommandCardsQuery,
  useCommandCardByIdQuery,
  useCommandCardsByIdsQuery,
};
