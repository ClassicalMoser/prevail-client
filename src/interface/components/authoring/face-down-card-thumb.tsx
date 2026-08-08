import { cx } from '@interface/lib';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

/** Placeholder for a seat-hidden command card (awaiting reveal). */
export const FaceDownCardThumb = (props: {
  label?: string;
  meta?: string;
}): JSX.Element => (
  <div class="flex w-fit max-w-full flex-col gap-1 overflow-visible">
    <div
      class={cx(
        'aspect-5/7 w-16 rounded-md border border-dashed border-muted-foreground/50',
        'bg-muted/80 sm:w-18',
        'flex items-center justify-center',
      )}
      aria-hidden="true"
    >
      <span class="text-muted-foreground text-[0.6rem] tracking-wide uppercase">
        Hidden
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
  </div>
);
