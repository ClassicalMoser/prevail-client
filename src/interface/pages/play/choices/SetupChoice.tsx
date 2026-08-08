import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';
import { DraftControls } from './DraftControls';

export function SetupChoice(props: {
  awaitingCommander: Accessor<boolean>;
  choicePending: Accessor<boolean>;
  canUndo: Accessor<boolean>;
  hasSetupUnits: Accessor<boolean>;
  onUndo: () => void;
  onReset: () => void;
}): JSX.Element {
  return (
    <>
      <p class="text-muted-foreground text-xs">
        Select a unit from the strip under the board, then click a facing arrow
        on a setup cell (or click the cell for the default facing). When all
        units are down, click a cell for your commander.
      </p>
      <Show when={props.awaitingCommander()}>
        <p class="text-xs font-medium text-amber-700 dark:text-amber-300">
          Choose a setup-zone cell for your commander.
        </p>
      </Show>
      <Show when={!props.hasSetupUnits()}>
        <p class="text-destructive text-xs">
          No reserved units for this seat.
        </p>
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
