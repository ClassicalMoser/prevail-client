import type { ComponentProps, JSX } from 'solid-js';
import { cx } from '@interface/lib';
import { splitProps } from 'solid-js';

export type InputProps = ComponentProps<'input'> & {
  class?: string;
};

export const Input = (props: InputProps): JSX.Element => {
  const [local, rest] = splitProps(props, ['class', 'type']);

  return (
    <input
      type={local.type ?? 'text'}
      data-slot="input"
      class={cx(
        'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
        'placeholder:text-muted-foreground',
        'selection:bg-primary selection:text-primary-foreground',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid]:border-destructive aria-[invalid]:ring-destructive/20',
        local.class,
      )}
      {...rest}
    />
  );
};
