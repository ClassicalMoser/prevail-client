import type { IssuedCommandView, PlayCardSlotView } from '@application';
import { formatCommandLabel } from '@application';
import type { Command, PlayerSide } from '@classicalmoser/prevail-rules/domain';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FaceDownCardThumb,
  PublishedCardThumb,
} from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';

function SlotView(props: { slot: Accessor<PlayCardSlotView> }): JSX.Element {
  return (
    <Show
      when={
        props.slot().kind === 'card'
          ? (props.slot() as Extract<PlayCardSlotView, { kind: 'card' }>)
          : undefined
      }
      fallback={
        <Show
          when={
            props.slot().kind === 'facedown'
              ? (props.slot() as Extract<
                  PlayCardSlotView,
                  { kind: 'facedown' }
                >)
              : undefined
          }
          fallback={
            <div class="text-muted-foreground flex h-24 w-16 flex-col items-center justify-center rounded-md border border-dashed text-center text-[0.65rem] sm:w-18">
              {props.slot().label}
            </div>
          }
        >
          {(facedown) => (
            <FaceDownCardThumb label={facedown().label} meta="Hidden" />
          )}
        </Show>
      }
    >
      {(revealed) => (
        <>
          <PublishedCardThumb
            kind="command"
            id={revealed().card.id}
            version={revealed().card.version}
            name={revealed().card.name}
            meta={revealed().label}
            size="xs"
          />
          <p class="text-muted-foreground max-w-40 text-center text-[0.65rem]">
            {formatCommandLabel(revealed().card.command)}
          </p>
        </>
      )}
    </Show>
  );
}

/** You / opponent card slots, remaining commands, and issued-command log. */
export function PlayTableStrip(props: {
  humanSide: Accessor<PlayerSide>;
  you: Accessor<PlayCardSlotView>;
  opponent: Accessor<PlayCardSlotView>;
  remaining: Accessor<Partial<Record<PlayerSide, Command[]>> | null>;
  issued: Accessor<IssuedCommandView[]>;
}): JSX.Element {
  const opponentSide = (): PlayerSide =>
    props.humanSide() === 'white' ? 'black' : 'white';

  return (
    <Card class="w-full max-w-3xl shrink-0 text-left">
      <CardHeader class="py-3">
        <CardTitle class="text-base">Table</CardTitle>
        <CardDescription>
          Your card vs opponent · issued commands this round
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-3 pt-0">
        <div class="flex flex-wrap items-start justify-center gap-6">
          <div class="flex flex-col items-center gap-1">
            <p class="text-muted-foreground text-xs">You</p>
            <SlotView slot={props.you} />
          </div>
          <div class="flex flex-col items-center gap-1">
            <p class="text-muted-foreground text-xs">Opponent</p>
            <SlotView slot={props.opponent} />
          </div>
        </div>

        <Show when={props.remaining()}>
          {(remaining) => (
            <div class="text-muted-foreground grid gap-1 text-xs sm:grid-cols-2">
              <p>
                Your remaining:{' '}
                {(remaining()[props.humanSide()] ?? [])
                  .map((command) => formatCommandLabel(command))
                  .join(', ') || '—'}
              </p>
              <p>
                Opponent remaining:{' '}
                {(remaining()[opponentSide()] ?? [])
                  .map((command) => formatCommandLabel(command))
                  .join(', ') || '—'}
              </p>
            </div>
          )}
        </Show>

        <Show when={props.issued().length > 0}>
          <ul class="flex flex-col gap-1 text-xs">
            <For each={props.issued()}>
              {(entry) => (
                <li class="border-border rounded-md border px-2 py-1">
                  <span class="font-medium">{entry.player}</span>:{' '}
                  {entry.commandLabel} → {entry.unitLabels.join(', ')}
                </li>
              )}
            </For>
          </ul>
        </Show>
      </CardContent>
    </Card>
  );
}
