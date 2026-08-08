import {
  formatCombatEngagementLine,
  formatCommitmentStatus,
} from '@application';
import type { CombatContextView } from '@application';
import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';

function commitmentLine(
  label: string,
  status: CombatContextView['whiteCommitment'],
): JSX.Element {
  return (
    <p class="play-combat__commit">
      <span class="play-combat__commit-side">{label}</span>
      <span class="play-combat__commit-status">
        {formatCommitmentStatus(status)}
      </span>
    </p>
  );
}

/** Active melee engagement + commitment status for the seat rail. */
export function CombatContextPanel(props: {
  context: Accessor<CombatContextView | null>;
  humanSide: Accessor<PlayerSide>;
}): JSX.Element {
  const youLabel = (): string =>
    props.humanSide() === 'white' ? 'You (white)' : 'You (black)';
  const oppLabel = (): string =>
    props.humanSide() === 'white' ? 'Opponent (black)' : 'Opponent (white)';

  return (
    <Show when={props.context()}>
      {(ctx) => (
        <section class="play-combat" aria-label="Melee context">
          <p class="play-combat__title">Melee</p>
          <p class="play-combat__engagement">
            {formatCombatEngagementLine(ctx())}
          </p>
          {commitmentLine(
            youLabel(),
            props.humanSide() === 'white'
              ? ctx().whiteCommitment
              : ctx().blackCommitment,
          )}
          {commitmentLine(
            oppLabel(),
            props.humanSide() === 'white'
              ? ctx().blackCommitment
              : ctx().whiteCommitment,
          )}
        </section>
      )}
    </Show>
  );
}
