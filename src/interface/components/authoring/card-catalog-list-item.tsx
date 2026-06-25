import { Badge, buttonVariants } from '@interface/components';
import { Link } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import type {
  CardCatalogItem,
  CardCatalogListItemProps,
} from './card-catalog-types';

export const CardCatalogListItem = <TItem extends CardCatalogItem>(
  props: CardCatalogListItemProps<TItem>,
): JSX.Element => (
  <div class="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex flex-col gap-1">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-lg font-semibold">{props.item.name ?? 'Untitled'}</h2>
        <Badge variant={props.item.version === null ? 'outline' : 'secondary'}>
          {props.item.version === null
            ? 'No version'
            : `v${props.item.version}`}
        </Badge>
        {props.renderMetadataBadges?.(props.item)}
      </div>
      <p class="text-muted-foreground font-mono text-xs">{props.item.id}</p>
    </div>
    <Link
      to={props.editRoute}
      params={{ cardId: props.item.id }}
      class={buttonVariants({ variant: 'outline' })}
    >
      Edit
    </Link>
  </div>
);
