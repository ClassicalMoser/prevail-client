import type { ComponentProps, JSX } from 'solid-js';
import { cx } from '@interface/lib';
import { splitProps } from 'solid-js';

/** Zaidan vega — https://zaidan.carere.dev/r/kobalte/input.json */
export type InputProps = ComponentProps<'input'>;

export const Input = (props: InputProps): JSX.Element => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <input
      data-slot="input"
      class={cx(
        'z-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        local.class,
      )}
      {...others}
    />
  );
};
