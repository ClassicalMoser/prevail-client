import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';

export function RoutChoice(props: {
  hint: Accessor<string | null>;
}): JSX.Element {
  return (
    <Show when={props.hint()}>
      {(hint) => <p class="text-muted-foreground text-xs">{hint()}</p>}
    </Show>
  );
}
