import type { JSX } from 'solid-js';
import { cx } from '@interface/lib';
import { splitProps } from 'solid-js';

export interface SeparatorProps {
  class?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Separator = (props: SeparatorProps): JSX.Element => {
  const [local] = splitProps(props, ['class', 'orientation']);

  if ((local.orientation ?? 'horizontal') === 'vertical') {
    return (
      <div
        data-slot="separator"
        aria-orientation="vertical"
        class={cx('bg-border h-full w-px shrink-0', local.class)}
      />
    );
  }

  return (
    <hr
      data-slot="separator"
      class={cx('bg-border h-px w-full shrink-0 border-0', local.class)}
    />
  );
};
