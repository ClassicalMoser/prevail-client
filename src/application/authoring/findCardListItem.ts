import type { CardListItem } from '@classicalmoser/prevail-contracts';

export function findCardListItem(
  cards: CardListItem[] | undefined,
  id: string,
): CardListItem | undefined {
  return cards?.find((card) => card.id === id);
}
