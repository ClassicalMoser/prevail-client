import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';
import { Button } from '../button';

export const EditorToolbar = (props: {
  title: Accessor<string>;
  subtitle?: Accessor<string | undefined>;
  isSaving?: Accessor<boolean>;
  isPreviewing?: Accessor<boolean>;
  saveLabel?: Accessor<string>;
  savingLabel?: Accessor<string>;
  onSave: () => void;
  onPreview?: () => void;
}): JSX.Element => (
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="font-display text-3xl tracking-wide">{props.title()}</h1>
      {props.subtitle !== undefined ? (
        <p class="text-muted-foreground text-sm">{props.subtitle()}</p>
      ) : null}
    </div>
    <div class="flex flex-wrap gap-2">
      <Show when={props.onPreview !== undefined}>
        <Button
          type="button"
          variant="outline"
          disabled={props.isPreviewing?.()}
          onClick={() => props.onPreview?.()}
        >
          {props.isPreviewing?.() ? 'Previewing…' : 'Preview'}
        </Button>
      </Show>
      <Button
        type="button"
        disabled={props.isSaving?.()}
        onClick={props.onSave}
      >
        {props.isSaving?.()
          ? (props.savingLabel?.() ?? 'Publishing…')
          : (props.saveLabel?.() ?? 'Publish Version')}
      </Button>
    </div>
  </div>
);
