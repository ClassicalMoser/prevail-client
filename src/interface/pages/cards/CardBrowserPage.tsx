import {
  useCurrentCommandCardsQuery,
  useCurrentUnitCardsQuery,
} from '@application';
import { Button, Card, CardContent, CardGallery } from '@interface/components';
import type { PublishedCardKind } from '@interface/lib';
import type { JSX } from 'solid-js';
import { createMemo, createSignal, Show } from 'solid-js';

const sortByName = <T extends { name: string }>(cards: readonly T[]): T[] =>
  [...cards].toSorted((left, right) => left.name.localeCompare(right.name));

export function CardBrowserPage(): JSX.Element {
  const [kind, setKind] = createSignal<PublishedCardKind>('command');
  const commandCards = useCurrentCommandCardsQuery();
  const unitCards = useCurrentUnitCardsQuery();

  const sortedCommandCards = createMemo(() =>
    commandCards.data === undefined ? undefined : sortByName(commandCards.data),
  );
  const sortedUnitCards = createMemo(() =>
    unitCards.data === undefined ? undefined : sortByName(unitCards.data),
  );

  const isLoading = (): boolean =>
    kind() === 'command' ? commandCards.isLoading : unitCards.isLoading;

  const isError = (): boolean =>
    kind() === 'command' ? commandCards.isError : unitCards.isError;

  const errorMessage = (): string | undefined =>
    kind() === 'command'
      ? commandCards.error?.message
      : unitCards.error?.message;

  const activeCards = createMemo(() => {
    const cards =
      kind() === 'command' ? sortedCommandCards() : sortedUnitCards();
    return cards ?? [];
  });

  return (
    <main class="container mx-auto flex flex-col gap-6 p-4 py-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="font-display text-3xl tracking-wide">Card Browser</h1>
          <p class="text-muted-foreground text-sm">
            Current legal command and unit cards.
          </p>
        </div>
        <div class="flex gap-2">
          <Button
            type="button"
            variant={kind() === 'command' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setKind('command');
            }}
          >
            Command
          </Button>
          <Button
            type="button"
            variant={kind() === 'unit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setKind('unit');
            }}
          >
            Unit
          </Button>
        </div>
      </div>

      <Show
        when={!isLoading()}
        fallback={<p class="text-muted-foreground">Loading cards…</p>}
      >
        <Show
          when={!isError()}
          fallback={
            <Card>
              <CardContent class="py-6">
                <p class="text-destructive text-sm">
                  {errorMessage() ?? 'Failed to load cards.'}
                </p>
              </CardContent>
            </Card>
          }
        >
          <Show
            when={activeCards().length > 0}
            fallback={
              <Card>
                <CardContent class="py-6">
                  <p class="text-muted-foreground text-sm">
                    No current {kind()} cards published yet.
                  </p>
                </CardContent>
              </Card>
            }
          >
            <CardGallery cards={activeCards} kind={kind()} />
          </Show>
        </Show>
      </Show>
    </main>
  );
}
