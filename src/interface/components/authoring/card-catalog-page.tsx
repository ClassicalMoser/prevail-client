import type { PublishedCardKind } from '@interface/lib';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { Button } from '../button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../card';
import { CardCatalogListItem } from './card-catalog-list-item';
import type { CardCatalogItem } from './card-catalog-types';

export type { CardCatalogItem } from './card-catalog-types';

const catalogGrid =
  'grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12';

export interface CardCatalogPageProps<TItem extends CardCatalogItem> {
  title: string;
  description: string;
  loadingMessage: string;
  emptyTitle: string;
  emptyDescription: string;
  loadErrorMessage: string;
  kind: PublishedCardKind;
  editRoute: '/command-cards/$cardId' | '/unit-cards/$cardId';
  isLoading: Accessor<boolean>;
  isError: Accessor<boolean>;
  errorMessage: Accessor<string | undefined>;
  cards: Accessor<TItem[] | undefined>;
  hasEmptyCards: Accessor<boolean>;
  isCreatingDraft: Accessor<boolean>;
  createDraft: () => void;
  isCertifying: Accessor<boolean>;
  certify: () => void;
  isCleaningUp: Accessor<boolean>;
  cleanupEmpty: () => void;
  renderMetadataBadges?: (item: TItem) => JSX.Element;
}

/** Visual catalog shell shared by command and unit card authoring. */
export const CardCatalogPage = <TItem extends CardCatalogItem>(
  props: CardCatalogPageProps<TItem>,
): JSX.Element => (
  <main class="container mx-auto flex flex-col gap-6 p-4 py-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-3xl tracking-wide">{props.title}</h1>
        <p class="text-muted-foreground text-sm">{props.description}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={props.isCertifying()}
          onClick={props.certify}
        >
          {props.isCertifying() ? 'Certifying…' : 'Certify Latest'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={props.isCleaningUp() || !props.hasEmptyCards()}
          onClick={props.cleanupEmpty}
        >
          {props.isCleaningUp() ? 'Cleaning up…' : 'Cleanup Empty'}
        </Button>
        <Button
          type="button"
          disabled={props.isCreatingDraft()}
          onClick={props.createDraft}
        >
          {props.isCreatingDraft() ? 'Creating…' : 'New Draft'}
        </Button>
      </div>
    </div>

    <Show
      when={!props.isLoading()}
      fallback={<p class="text-muted-foreground">{props.loadingMessage}</p>}
    >
      <Show
        when={props.isError()}
        fallback={
          <Show
            when={(props.cards()?.length ?? 0) > 0}
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>{props.emptyTitle}</CardTitle>
                  <CardDescription>{props.emptyDescription}</CardDescription>
                </CardHeader>
              </Card>
            }
          >
            <Card class="overflow-visible!">
              <CardContent class="overflow-visible! pt-6">
                <ul class={catalogGrid}>
                  <For each={props.cards()}>
                    {(item) => (
                      <li>
                        <CardCatalogListItem
                          item={item}
                          kind={props.kind}
                          editRoute={props.editRoute}
                          renderMetadataBadges={props.renderMetadataBadges}
                        />
                      </li>
                    )}
                  </For>
                </ul>
              </CardContent>
            </Card>
          </Show>
        }
      >
        <Card>
          <CardContent class="py-6">
            <p class="text-destructive text-sm">
              {props.errorMessage() ?? props.loadErrorMessage}
            </p>
          </CardContent>
        </Card>
      </Show>
    </Show>
  </main>
);
