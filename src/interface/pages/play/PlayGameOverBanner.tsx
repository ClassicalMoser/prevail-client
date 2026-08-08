import type { GameOutcome } from '@application';
import { gameOutcomeDetail, gameOutcomeHeadline } from '@application';
import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';

/** Endgame banner for the play rail / overlay. */
export function PlayGameOverBanner(props: {
  outcome: Accessor<GameOutcome>;
  humanSide: Accessor<PlayerSide>;
}): JSX.Element {
  const headline = (): string | undefined =>
    gameOutcomeHeadline(props.outcome(), props.humanSide());
  const detail = (): string | undefined =>
    gameOutcomeDetail(props.outcome(), props.humanSide());

  return (
    <Show when={headline()}>
      {(title) => (
        <output class="border-border bg-muted/40 flex flex-col gap-1 rounded-md border px-3 py-3">
          <p class="font-display text-lg tracking-wide">{title()}</p>
          <Show when={detail()}>
            {(body) => <p class="text-muted-foreground text-xs">{body()}</p>}
          </Show>
        </output>
      )}
    </Show>
  );
}
