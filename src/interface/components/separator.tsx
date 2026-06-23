import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import type { SeparatorRootProps } from '@kobalte/core/separator';
import { Separator as SeparatorPrimitive } from '@kobalte/core/separator';
import type { ComponentProps, JSX, ValidComponent } from 'solid-js';
import { cx } from '@interface/lib';
import { mergeProps, splitProps } from 'solid-js';

/** Zaidan vega — https://zaidan.carere.dev/r/kobalte/separator.json */
export type SeparatorProps<T extends ValidComponent = 'hr'> = PolymorphicProps<
  T,
  SeparatorRootProps<T>
> &
  Pick<ComponentProps<T>, 'class'>;

export const Separator = <T extends ValidComponent = 'hr'>(
  props: SeparatorProps<T>,
): JSX.Element => {
  const mergedProps = mergeProps({ orientation: 'horizontal' } as const, props);
  const [local, others] = splitProps(mergedProps as SeparatorProps, ['class']);

  return (
    <SeparatorPrimitive
      data-slot="separator"
      class={cx(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px',
        local.class,
      )}
      {...others}
    />
  );
};
