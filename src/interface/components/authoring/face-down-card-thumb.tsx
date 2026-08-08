import { cx } from '@interface/lib';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

/** Placeholder for a seat-hidden / skip-style card tile. */
export const FaceDownCardThumb = (props: {
  label?: string;
  meta?: string;
  /** Face stamp (default Hidden). */
  stamp?: string;
  selected?: boolean;
  disabled?: boolean;
  onActivate?: () => void;
}): JSX.Element => {
  const body = (
    <>
      <div
        class={cx(
          'aspect-5/7 w-16 rounded-md border border-dashed border-muted-foreground/50',
          'bg-muted/80 sm:w-18',
          'flex items-center justify-center',
        )}
        aria-hidden="true"
      >
        <span class="text-muted-foreground text-[0.6rem] tracking-wide uppercase">
          {props.stamp ?? 'Hidden'}
        </span>
      </div>
      <p
        class="max-w-16 truncate text-[0.65rem] font-medium leading-tight sm:max-w-18"
        title={props.label ?? 'Facedown'}
      >
        {props.label ?? 'Facedown'}
      </p>
      <Show when={props.meta}>
        {(meta) => (
          <p
            class="text-muted-foreground max-w-16 truncate text-[0.6rem] leading-tight sm:max-w-18"
            title={meta()}
          >
            {meta()}
          </p>
        )}
      </Show>
    </>
  );

  return (
    <Show
      when={props.onActivate !== undefined}
      fallback={
        <div class="flex w-fit max-w-full flex-col gap-1 overflow-visible">
          {body}
        </div>
      }
    >
      <button
        type="button"
        disabled={props.disabled}
        aria-pressed={props.selected === true}
        class={cx(
          'focus-visible:ring-ring relative flex w-fit max-w-full flex-col gap-1 overflow-visible rounded-md text-left outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-40',
          props.selected === true
            ? 'ring-ring ring-2'
            : 'hover:ring-ring hover:ring-2',
        )}
        onClick={() => {
          props.onActivate?.();
        }}
      >
        {body}
      </button>
    </Show>
  );
};
