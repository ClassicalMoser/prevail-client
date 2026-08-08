import { Button } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';
import { DraftControls } from './DraftControls';

export function SupportChoice(props: {
  hint: Accessor<string | null>;
  canConfirm: Accessor<boolean>;
  canUndo: Accessor<boolean>;
  choicePending: Accessor<boolean>;
  onConfirm: () => void;
  onUndo: () => void;
  onReset: () => void;
}): JSX.Element {
  return (
    <Show when={props.hint()}>
      {(hint) => (
        <>
          <p class="text-muted-foreground text-xs">{hint()}</p>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!props.canConfirm()}
              onClick={props.onConfirm}
            >
              Confirm support
            </Button>
            <DraftControls
              canUndo={props.canUndo}
              choicePending={props.choicePending}
              onUndo={props.onUndo}
              onReset={props.onReset}
            />
          </div>
        </>
      )}
    </Show>
  );
}
