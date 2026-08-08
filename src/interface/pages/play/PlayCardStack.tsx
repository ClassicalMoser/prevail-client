import type { Accessor, JSX } from 'solid-js';

/** Facedown pile with a count badge — discard / played / burnt. */
export function PlayCardStack(props: {
  label: Accessor<string>;
  count: Accessor<number>;
}): JSX.Element {
  return (
    <div class="play-stack" aria-label={`${props.label()}: ${props.count()}`}>
      <div
        class="play-stack__deck"
        classList={{ 'play-stack__deck--empty': props.count() === 0 }}
      >
        <span class="play-stack__count">{props.count()}</span>
      </div>
      <span class="play-stack__label">{props.label()}</span>
    </div>
  );
}
