import { Button } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';
import { DraftControls } from './DraftControls';

export function RangedChoice(props: {
  progress: Accessor<string | null>;
  canConfirm: Accessor<boolean>;
  canUndo: Accessor<boolean>;
  choicePending: Accessor<boolean>;
  onConfirm: () => void;
  onUndo: () => void;
  onReset: () => void;
}): JSX.Element {
  return (
    <>
      <p class="text-muted-foreground text-xs">
        Resolve ranged fire: attacker → enemy target → optional supporters, then
        Confirm.
      </p>
      <Show when={props.progress()}>
        {(progress) => (
          <p class="text-muted-foreground text-xs">{progress()}</p>
        )}
      </Show>
      <div class="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!props.canConfirm()}
          onClick={props.onConfirm}
        >
          Confirm attack
        </Button>
        <DraftControls
          canUndo={props.canUndo}
          choicePending={props.choicePending}
          onUndo={props.onUndo}
          onReset={props.onReset}
        />
      </div>
    </>
  );
}
