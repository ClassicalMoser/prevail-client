import {
  formatCombatEngagementLine,
  formatCommitmentStatus,
  seatCommitmentSideLabel,
} from '@application';
import type { CombatContextView } from '@application';
import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import { Show } from 'solid-js';
import type { Accessor, JSX } from 'solid-js';

function commitmentLine(
  label: string,
  status: CombatContextView['whiteCommitment'],
): JSX.Element {
  const line = (
    <p class="play-combat__commit">
      <span class="play-combat__commit-side">{label}</span>
      <span class="play-combat__commit-status">
        {formatCommitmentStatus(status)}
      </span>
    </p>
  );
  return line;
}

/** Active melee engagement + commitment status for the seat rail. */
export function CombatContextPanel(props: {
  context: Accessor<CombatContextView | undefined>;
  humanSide: Accessor<PlayerSide>;
}): JSX.Element {
  return (
    <Show when={props.context()}>
      {(ctx) => (
        <section class="play-combat" aria-label="Melee context">
          <p class="play-combat__title">Melee</p>
          <p class="play-combat__engagement">
            {formatCombatEngagementLine(ctx())}
          </p>
          {commitmentLine(
            seatCommitmentSideLabel(props.humanSide(), 'you'),
            props.humanSide() === 'white'
              ? ctx().whiteCommitment
              : ctx().blackCommitment,
          )}
          {commitmentLine(
            seatCommitmentSideLabel(props.humanSide(), 'opponent'),
            props.humanSide() === 'white'
              ? ctx().blackCommitment
              : ctx().whiteCommitment,
          )}
        </section>
      )}
    </Show>
  );
}
