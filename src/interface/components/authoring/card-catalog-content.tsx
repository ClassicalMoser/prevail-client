import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@interface/components';
import type { UseQueryResult } from '@tanstack/solid-query';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { CardCatalogListItem } from './card-catalog-list-item';
import type { CardCatalogItem } from './card-catalog-types';

export const CardCatalogContent = <TItem extends CardCatalogItem>(props: {
  query: UseQueryResult<TItem[], Error>;
  loadingMessage: string;
  emptyTitle: string;
  emptyDescription: string;
  loadErrorMessage: string;
  editRoute: '/command-cards/$cardId' | '/unit-cards/$cardId';
  renderMetadataBadges: (item: TItem) => JSX.Element;
}): JSX.Element => (
  <Show
    when={!props.query.isLoading}
    fallback={<p class="text-muted-foreground">{props.loadingMessage}</p>}
  >
    <Show
      when={props.query.isError}
      fallback={
        <Show
          when={(props.query.data?.length ?? 0) > 0}
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>{props.emptyTitle}</CardTitle>
                <CardDescription>{props.emptyDescription}</CardDescription>
              </CardHeader>
            </Card>
          }
        >
          <div class="grid gap-4">
            <For each={props.query.data}>
              {(item) => (
                <Card>
                  <CardContent>
                    <CardCatalogListItem
                      item={item}
                      editRoute={props.editRoute}
                      renderMetadataBadges={props.renderMetadataBadges}
                    />
                  </CardContent>
                </Card>
              )}
            </For>
          </div>
        </Show>
      }
    >
      <Card>
        <CardContent class="py-6">
          <p class="text-destructive text-sm">
            {props.query.error?.message ?? props.loadErrorMessage}
          </p>
        </CardContent>
      </Card>
    </Show>
  </Show>
);
