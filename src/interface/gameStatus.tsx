import type { PhaseSummary } from '@application/gameState';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';

function formatPhaseSummary(summary: PhaseSummary | undefined): string {
  if (summary === undefined) {
    return '—';
  }
  if (summary.kind === 'none') {
    return 'None (pre-phase)';
  }
  return `${summary.phase} / ${summary.step}`;
}

export const GameStatus = (props: {
  hasGameState: Accessor<boolean>;
  roundNumber: Accessor<number | undefined>;
  initiative: Accessor<string | undefined>;
  phaseSummary: Accessor<PhaseSummary | undefined>;
}): JSX.Element => (
  <Card class="w-full max-w-md text-left" aria-labelledby="game-status-heading">
    <CardHeader>
      <CardTitle id="game-status-heading">Game status</CardTitle>
      <Show when={!props.hasGameState()}>
        <CardDescription>No game loaded yet.</CardDescription>
      </Show>
    </CardHeader>
    <Show when={props.hasGameState()}>
      <CardContent>
        <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt class="text-muted-foreground">Round</dt>
          <dd>{props.roundNumber() ?? '—'}</dd>
          <dt class="text-muted-foreground">Initiative</dt>
          <dd>{props.initiative() ?? '—'}</dd>
          <dt class="text-muted-foreground">Phase</dt>
          <dd>{formatPhaseSummary(props.phaseSummary())}</dd>
        </dl>
      </CardContent>
    </Show>
  </Card>
);
