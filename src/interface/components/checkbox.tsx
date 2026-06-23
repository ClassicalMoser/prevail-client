import type { ComponentProps, JSX } from 'solid-js';
import { cx } from '@interface/lib';
import { splitProps } from 'solid-js';

export type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  class?: string;
};

export const Checkbox = (props: CheckboxProps): JSX.Element => {
  const [local, rest] = splitProps(props, ['class']);

  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      class={cx(
        'size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'accent-primary',
        local.class,
      )}
      {...rest}
    />
  );
};
