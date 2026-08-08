import { cardSvgUrl } from '@interface/lib';
import type { PublishedCardKind } from '@interface/lib';
import type { Accessor, JSX } from 'solid-js';
import { For } from 'solid-js';

export interface CardGalleryItem {
  id: string;
  name: string;
  version: string;
}

export const CardGallery = (props: {
  cards: Accessor<readonly CardGalleryItem[] | undefined>;
  kind: PublishedCardKind;
}): JSX.Element => (
  <ul class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    <For each={props.cards()}>
      {(card) => (
        <li class="flex flex-col gap-2">
          <div class="overflow-hidden rounded-lg border bg-card shadow-sm">
            <img
              src={cardSvgUrl(props.kind, card.id, card.version)}
              alt={card.name}
              loading="lazy"
              class="aspect-5/7 w-full object-contain"
            />
          </div>
          <div class="px-1">
            <p class="text-sm font-medium leading-tight">{card.name}</p>
            <p class="text-muted-foreground text-xs">{card.version}</p>
          </div>
        </li>
      )}
    </For>
  </ul>
);
