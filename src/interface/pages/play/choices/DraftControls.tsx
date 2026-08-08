import { Button } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';

/** Shared Undo / Reset for staged seat drafts. */
export function DraftControls(props: {
  canUndo: Accessor<boolean>;
  choicePending: Accessor<boolean>;
  onUndo: () => void;
  onReset: () => void;
}): JSX.Element {
  return (
    <div class="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!props.canUndo()}
        onClick={props.onUndo}
      >
        Undo
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={props.choicePending()}
        onClick={props.onReset}
      >
        Reset
      </Button>
    </div>
  );
}
