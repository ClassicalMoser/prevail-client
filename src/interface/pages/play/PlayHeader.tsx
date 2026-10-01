import { gameOutcomeHeadline, playerSideLabel } from '@application';
import type { GameOutcome, UseSeatPlaySessionResult } from '@application';
import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import { Button } from '@interface/components';
import { Link } from '@tanstack/solid-router';
import { X } from 'lucide-solid';
import { Show } from 'solid-js';
import type { Accessor, JSX } from 'solid-js';

export function PlayHeader(props: {
  humanSide: Accessor<PlayerSide>;
  session: UseSeatPlaySessionResult;
  waitHint: Accessor<string | undefined>;
  hasGameState: Accessor<boolean>;
  roundNumber: Accessor<number | undefined>;
  initiativeLabel: Accessor<string | undefined>;
  phaseLabel: Accessor<string>;
  outcome: Accessor<GameOutcome>;
  pressure: Accessor<string | undefined>;
}): JSX.Element {
  const outcomeLabel = (): string | undefined =>
    gameOutcomeHeadline(props.outcome(), props.humanSide());

  return (
    <header class="play-header border-border flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b px-2 py-1.5 text-sm">
      <Show when={props.hasGameState()}>
        <span
          class="play-header__phase text-foreground text-xs"
          title={props.phaseLabel()}
        >
          R{props.roundNumber() ?? '—'} · {props.initiativeLabel() ?? '—'} ·{' '}
          {props.phaseLabel()}
        </span>
      </Show>
      <span class="text-muted-foreground text-[0.65rem]">
        {playerSideLabel(props.humanSide())} · {props.session.connectionStatus()}
      </span>
      <Show when={props.pressure()}>
        {(chip) => (
          <span class="play-header__pressure text-muted-foreground text-xs">
            {chip()}
          </span>
        )}
      </Show>
      <Show when={outcomeLabel()}>
        {(label) => (
          <span class="text-foreground text-xs font-medium">{label()}</span>
        )}
      </Show>
      <Show when={props.session.choicePending()}>
        <span class="text-muted-foreground text-xs">Waiting for server…</span>
      </Show>
      <Show when={props.waitHint()}>
        {(hint) => <span class="text-muted-foreground text-xs">{hint()}</span>}
      </Show>
      <Show when={props.session.choiceRejected()}>
        {(rejection) => (
          <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <p class="text-destructive text-xs">
              Rejected: {rejection().errorReason}
            </p>
            <Button
              type="button"
              size="sm"
              disabled={!props.session.canRetry()}
              onClick={props.session.onRetryLastChoice}
            >
              Retry
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!props.session.canUndo()}
              onClick={props.session.onUndo}
            >
              Undo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={props.session.onResetSelection}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={props.session.clearRejection}
            >
              Dismiss
            </Button>
          </div>
        )}
      </Show>
      <Link
        to="/play"
        class="text-muted-foreground hover:text-foreground hover:bg-muted ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-md"
        aria-label="Leave game"
        title="Leave game"
      >
        <X class="size-4" />
      </Link>
    </header>
  );
}
