import type { ComponentProps, JSX } from 'solid-js';
import { cx } from '@interface/lib';
import { splitProps } from 'solid-js';

export type NativeSelectProps = ComponentProps<'select'> & {
  class?: string;
};

export const NativeSelect = (props: NativeSelectProps): JSX.Element => {
  const [local, rest] = splitProps(props, ['class']);

  return (
    <select
      data-slot="native-select"
      class={cx(
        'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        local.class,
      )}
      {...rest}
    />
  );
};
