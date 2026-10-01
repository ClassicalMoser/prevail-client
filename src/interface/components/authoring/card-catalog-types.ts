import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { PublishedCardKind } from '@interface/lib';
import type { JSX } from 'solid-js';

/** Shared list-row shape for command and unit card catalogs. */
type CardCatalogItem = CardListItem;

interface CardCatalogListItemProps<TItem extends CardCatalogItem> {
  item: TItem;
  kind: PublishedCardKind;
  editRoute: '/command-cards/$cardId' | '/unit-cards/$cardId';
  renderMetadataBadges?: (item: TItem) => JSX.Element;
}

export type { CardCatalogItem, CardCatalogListItemProps };
