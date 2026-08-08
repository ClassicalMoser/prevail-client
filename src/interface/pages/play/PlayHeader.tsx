import type { PhaseSummary, UseSeatPlaySessionResult } from '@application';
import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import { Button } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';
import { formatPhase } from './playPageHelpers';

export function PlayHeader(props: {
  gameId: Accessor<string>;
  humanSide: Accessor<PlayerSide>;
  session: UseSeatPlaySessionResult;
  waitHint: Accessor<string | undefined>;
  hasGameState: Accessor<boolean>;
  roundNumber: Accessor<number | undefined>;
  initiative: Accessor<PlayerSide | undefined>;
  phaseSummary: Accessor<PhaseSummary | undefined>;
}): JSX.Element {
  return (
    <header class="border-border flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b px-3 py-2 text-sm">
      <span class="font-display tracking-wide">Play</span>
      <span class="text-muted-foreground text-xs">
        {props.gameId()} · {props.humanSide()} ·{' '}
        {props.session.connectionStatus()}
      </span>
      <Show when={props.hasGameState()}>
        <span class="text-muted-foreground hidden text-xs sm:inline">
          R{props.roundNumber() ?? '—'} · {props.initiative() ?? '—'} ·{' '}
          {formatPhase(props.phaseSummary())}
        </span>
      </Show>
      <Show when={props.session.choicePending()}>
        <span class="text-muted-foreground text-xs">Waiting for server…</span>
      </Show>
      <Show when={props.waitHint()}>
        {(hint) => <span class="text-muted-foreground text-xs">{hint()}</span>}
      </Show>
      <Show when={props.session.choiceRejected()}>
        {(rejection) => (
          <div class="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
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
    </header>
  );
}
