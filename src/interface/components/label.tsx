import type { ComponentProps, JSX } from 'solid-js';
import { cx } from '@interface/lib';
import { splitProps } from 'solid-js';

export type LabelProps = ComponentProps<'label'> & {
  class?: string;
};

export const Label = (props: LabelProps): JSX.Element => {
  const [local, rest] = splitProps(props, ['class']);

  return (
    // Primitive label styling; `for` is supplied by FormField and other callers.
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      data-slot="label"
      class={cx(
        'flex items-center gap-2 text-sm leading-none font-medium select-none',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        local.class,
      )}
      {...rest}
    />
  );
};
