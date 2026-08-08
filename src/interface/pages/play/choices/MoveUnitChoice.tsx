import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';
import { DraftControls } from './DraftControls';

export function MoveUnitChoice(props: {
  progress: Accessor<string | null>;
  canUndo: Accessor<boolean>;
  choicePending: Accessor<boolean>;
  onUndo: () => void;
  onReset: () => void;
}): JSX.Element {
  return (
    <>
      <p class="text-muted-foreground text-xs">
        Move a commanded unit: click the unit, then a highlighted destination.
      </p>
      <Show when={props.progress()}>
        {(progress) => (
          <p class="text-muted-foreground text-xs">{progress()}</p>
        )}
      </Show>
      <DraftControls
        canUndo={props.canUndo}
        choicePending={props.choicePending}
        onUndo={props.onUndo}
        onReset={props.onReset}
      />
    </>
  );
}
