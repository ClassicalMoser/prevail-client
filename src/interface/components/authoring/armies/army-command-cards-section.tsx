import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { PublishedCardThumb } from '../published-card-thumb';

const rosterGrid =
  'grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12';

export const ArmyCommandCardsSection = (props: {
  commandCards: Accessor<CommandCard[]>;
  catalog: Accessor<CommandCard[] | undefined>;
  isCatalogLoading: Accessor<boolean>;
  canAddCommand: (card: CommandCard) => boolean;
  onAdd: (card: CommandCard) => void;
  onRemove: (listIndex: number) => void;
}): JSX.Element => (
  <Card class="!overflow-visible">
    <CardHeader>
      <CardTitle>Command cards</CardTitle>
      <CardDescription>
        No duplicate cards. When the mode sets cards-per-initiative, you cannot
        exceed that count per initiative (or the army total).
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-6 !overflow-visible">
      <section aria-labelledby="army-commands-roster-heading">
        <h3 id="army-commands-roster-heading" class="font-heading mb-2 text-sm">
          In this army
        </h3>
        <Show
          when={props.commandCards().length > 0}
          fallback={
            <p class="text-muted-foreground text-sm">
              No command cards yet — pick from the catalog below.
            </p>
          }
        >
          <ul class={rosterGrid}>
            <For each={props.commandCards()}>
              {(card, index) => (
                <li>
                  <PublishedCardThumb
                    kind="command"
                    id={card.id}
                    version={card.version}
                    name={card.name}
                    meta={`Init ${card.initiative}`}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="h-7 px-1 text-xs"
                      onClick={() => {
                        props.onRemove(index());
                      }}
                    >
                      Remove
                    </Button>
                  </PublishedCardThumb>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </section>

      <section aria-labelledby="army-commands-catalog-heading">
        <h3
          id="army-commands-catalog-heading"
          class="font-heading mb-2 text-sm"
        >
          Available command cards
        </h3>
        <Show
          when={!props.isCatalogLoading()}
          fallback={
            <p class="text-muted-foreground text-sm">Loading command cards…</p>
          }
        >
          <Show
            when={(props.catalog()?.length ?? 0) > 0}
            fallback={
              <p class="text-muted-foreground text-sm">
                No current command cards available.
              </p>
            }
          >
            <ul class={rosterGrid}>
              <For each={props.catalog() ?? []}>
                {(card) => (
                  <li>
                    <PublishedCardThumb
                      kind="command"
                      id={card.id}
                      version={card.version}
                      name={card.name}
                      meta={`Init ${card.initiative}`}
                      disabled={!props.canAddCommand(card)}
                      onActivate={() => {
                        props.onAdd(card);
                      }}
                    />
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </Show>
      </section>
    </CardContent>
  </Card>
);
