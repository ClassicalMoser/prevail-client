import type { JSX } from 'solid-js';

/** Shared list-row shape for command and unit card catalogs. */
export interface CardCatalogItem {
  id: string;
  name: string;
  version: string;
}

export interface CardCatalogListItemProps<TItem extends CardCatalogItem> {
  item: TItem;
  editRoute: '/command-cards/$cardId' | '/unit-cards/$cardId';
  renderMetadataBadges: (item: TItem) => JSX.Element;
}
