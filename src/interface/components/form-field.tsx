import type { JSX } from 'solid-js';
import { cx } from '@interface/lib';

/** Field chrome: label text wraps the control for a11y without a separate `for` link. */
export const FormField = (props: {
  label: string;
  for: string;
  description?: string;
  children: JSX.Element;
}): JSX.Element => (
  <label class="flex flex-col gap-2">
    <span
      class={cx(
        'z-label flex select-none items-center peer-disabled:cursor-not-allowed group-data-[disabled=true]:pointer-events-none',
      )}
    >
      {props.label}
    </span>
    {props.children}
    {props.description !== undefined ? (
      <p class="text-muted-foreground text-xs">{props.description}</p>
    ) : null}
  </label>
);
