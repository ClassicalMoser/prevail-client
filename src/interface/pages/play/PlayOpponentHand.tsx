import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';

/**
 * Opponent hand — count is the signal; backs are a shallow peek, not a full fan.
 */
export function PlayOpponentHand(props: {
  count: Accessor<number>;
}): JSX.Element {
  return (
    <Show when={props.count() > 0}>
      <div
        class="play-opp-hand"
        aria-label={`Opponent hand, ${props.count()} cards`}
      >
        <div class="play-opp-hand__peek" aria-hidden="true">
          <span class="play-opp-hand__edge" />
          <span class="play-opp-hand__edge" />
          <span class="play-opp-hand__top" />
        </div>
        <span class="play-opp-hand__count">{props.count()}</span>
      </div>
    </Show>
  );
}
