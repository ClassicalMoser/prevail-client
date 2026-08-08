import type { IssuedCommandView } from '@application';
import { formatCommandLabel } from '@application';
import type { Command, PlayerSide } from '@classicalmoser/prevail-rules/domain';
import { Button } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';

/**
 * Issue-phase remaining commands and issued log (rail only — not card table).
 */
export function PlayTableStrip(props: {
  humanSide: Accessor<PlayerSide>;
  remaining: Accessor<Partial<Record<PlayerSide, Command[]>> | null>;
  issued: Accessor<IssuedCommandView[]>;
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
    <div class="play-commands flex flex-col gap-3">
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
