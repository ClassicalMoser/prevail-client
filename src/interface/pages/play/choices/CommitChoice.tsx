import { Button } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';

export function CommitChoice(props: {
  hint: Accessor<string | null>;
  canRefuseCommit: Accessor<boolean>;
  choicePending: Accessor<boolean>;
  onRefuseCommit: () => void;
}): JSX.Element {
  return (
    <Show when={props.hint()}>
      {(hint) => (
        <div class="flex flex-col gap-2">
          <p class="text-muted-foreground text-xs">{hint()}</p>
          <Show when={props.canRefuseCommit()}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={props.choicePending()}
              onClick={props.onRefuseCommit}
            >
              Don't commit
            </Button>
          </Show>
        </div>
      )}
    </Show>
  );
}
