import { Badge } from '../badge';
import { buttonVariants } from '../button';
import { Link } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import type {
  CardCatalogItem,
  CardCatalogListItemProps,
} from './card-catalog-types';
import { PublishedCardFace } from './published-card-face';

export const CardCatalogListItem = <TItem extends CardCatalogItem>(
  props: CardCatalogListItemProps<TItem>,
): JSX.Element => {
  const label = (): string => props.item.name ?? 'Untitled';

  return (
    <div class="group/thumb relative flex w-fit max-w-full flex-col gap-2 overflow-visible">
      <Show
        when={props.item.version}
        fallback={
          <div class="bg-muted text-muted-foreground flex aspect-5/7 w-16 items-center justify-center rounded-md border border-dashed text-center text-[0.6rem] leading-tight sm:w-18">
            No art yet
          </div>
        }
      >
        {(version) => (
          <>
            <PublishedCardFace
              kind={props.kind}
              id={props.item.id}
              version={version()}
              name={label()}
              size="xs"
            />
            <div
              class="pointer-events-none absolute bottom-[calc(100%+0.35rem)] left-1/2 z-50 hidden w-max -translate-x-1/2 group-hover/thumb:block group-focus-within/thumb:block"
              role="presentation"
            >
              <PublishedCardFace
                kind={props.kind}
                id={props.item.id}
                version={version()}
                name={label()}
                size="md"
                class="shadow-lg"
              />
            </div>
          </>
        )}
      </Show>

      <p
        class="max-w-16 truncate text-[0.65rem] font-medium leading-tight sm:max-w-18"
        title={label()}
      >
        {label()}
      </p>
      <div class="flex max-w-18 flex-col gap-1">
        <Badge
          variant={props.item.version === null ? 'outline' : 'secondary'}
          class="w-fit text-[0.6rem]"
        >
          {props.item.version === null
            ? 'No version'
            : `v${props.item.version}`}
        </Badge>
        {props.renderMetadataBadges?.(props.item)}
      </div>
      <Link
        to={props.editRoute}
        params={{ cardId: props.item.id }}
        class={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        Edit
      </Link>
    </div>
  );
};
