import type { IssuedCommandView, PlayCardSlotView } from '@application';
import { formatCommandLabel } from '@application';
import type { Command, PlayerSide } from '@classicalmoser/prevail-rules/domain';
import {
  Button,
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
            <div class="text-muted-foreground flex h-20 w-14 flex-col items-center justify-center rounded-md border border-dashed text-center text-[0.65rem]">
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
          <p class="text-muted-foreground max-w-36 text-center text-[0.65rem]">
            {formatCommandLabel(revealed().card.command)}
          </p>
        </>
      )}
    </Show>
  );
}

/** In-play card slots, remaining commands, and issued-command log (side rail). */
export function PlayTableStrip(props: {
  humanSide: Accessor<PlayerSide>;
  you: Accessor<PlayCardSlotView>;
  opponent: Accessor<PlayCardSlotView>;
  remaining: Accessor<Partial<Record<PlayerSide, Command[]>> | null>;
  issued: Accessor<IssuedCommandView[]>;
  /** When issuing, remaining slots are clickable command picks. */
  canSelectRemaining?: Accessor<boolean>;
  selectedRemainingIndex?: Accessor<number | undefined>;
  onSelectRemaining?: (index: number) => void;
}): JSX.Element {
  const opponentSide = (): PlayerSide =>
    props.humanSide() === 'white' ? 'black' : 'white';

  const yourRemaining = (): Command[] =>
    props.remaining()?.[props.humanSide()] ?? [];

  const canSelect = (): boolean => props.canSelectRemaining?.() === true;

  return (
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-start justify-center gap-4 lg:justify-start">
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
          <div class="flex flex-col gap-2 text-xs">
            <div class="flex flex-col gap-1.5">
              <p class="text-muted-foreground">Your remaining</p>
              <Show
                when={yourRemaining().length > 0}
                fallback={<p class="text-muted-foreground">—</p>}
              >
                <div class="flex flex-wrap gap-1.5">
                  <For each={yourRemaining()}>
                    {(command, index) => {
                      const selected = () =>
                        canSelect() &&
                        props.selectedRemainingIndex?.() === index();
                      return (
                        <Show
                          when={canSelect()}
                          fallback={
                            <span class="border-border rounded-md border px-2 py-1">
                              {formatCommandLabel(command)}
                            </span>
                          }
                        >
                          <Button
                            type="button"
                            size="sm"
                            variant={selected() ? 'default' : 'outline'}
                            onClick={() => props.onSelectRemaining?.(index())}
                          >
                            {formatCommandLabel(command)}
                          </Button>
                        </Show>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </div>
            <p class="text-muted-foreground">
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
    </div>
  );
}
