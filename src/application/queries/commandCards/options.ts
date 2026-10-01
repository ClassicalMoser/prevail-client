import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { CommandCards } from '@ports';
import { queryOptions } from '@tanstack/solid-query';
import type { QueryOptions } from '@tanstack/solid-query';
import { commandCardKeys } from '../keys';

function allCommandCardsQueryOptions(
  commandCards: CommandCards,
): QueryOptions<
  CardListItem[],
  Error,
  CardListItem[],
  typeof commandCardKeys.all
> {
  return queryOptions({
    queryKey: commandCardKeys.all,
    queryFn: () => commandCards.getAll(),
  });
}

function currentCommandCardsQueryOptions(
  commandCards: CommandCards,
): QueryOptions<
  CommandCard[],
  Error,
  CommandCard[],
  typeof commandCardKeys.current
> {
  return queryOptions({
    queryKey: commandCardKeys.current,
    queryFn: () => commandCards.getCurrent(),
  });
}

function commandCardByIdQueryOptions(
  commandCards: CommandCards,
  id: string,
): QueryOptions<
  CommandCard,
  Error,
  CommandCard,
  ReturnType<typeof commandCardKeys.detail>
> {
  return queryOptions({
    queryKey: commandCardKeys.detail(id),
    queryFn: () => commandCards.getById(id),
  });
}

function commandCardsByIdsQueryOptions(
  commandCards: CommandCards,
  ids: readonly string[],
): QueryOptions<
  CommandCard[],
  Error,
  CommandCard[],
  ReturnType<typeof commandCardKeys.byIds>
> {
  return queryOptions({
    queryKey: commandCardKeys.byIds(ids),
    queryFn: () => commandCards.getByIds(ids),
  });
}

export {
  allCommandCardsQueryOptions,
  currentCommandCardsQueryOptions,
  commandCardByIdQueryOptions,
  commandCardsByIdsQueryOptions,
};
