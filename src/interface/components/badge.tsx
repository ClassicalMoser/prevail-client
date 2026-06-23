import type { BadgeRootProps } from '@kobalte/core/badge';
import { Root } from '@kobalte/core/badge';
import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import type { VariantProps } from 'cva';
import type { JSX, ValidComponent } from 'solid-js';
import { cva } from '@interface/lib';
import { splitProps } from 'solid-js';

/** Zaidan vega — https://zaidan.carere.dev/r/kobalte/badge.json */
export const badgeVariants = cva({
  base: 'group/badge z-badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none',
  variants: {
    variant: {
      default: 'z-badge-variant-default',
      secondary: 'z-badge-variant-secondary',
      destructive: 'z-badge-variant-destructive',
      outline: 'z-badge-variant-outline',
      ghost: 'z-badge-variant-ghost',
      link: 'z-badge-variant-link',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type BadgeProps<T extends ValidComponent = 'span'> = PolymorphicProps<
  T,
  BadgeRootProps<T>
> &
  VariantProps<typeof badgeVariants>;

export const Badge = <T extends ValidComponent = 'span'>(
  props: BadgeProps<T>,
): JSX.Element => {
  const [local, others] = splitProps(props as BadgeProps, ['class', 'variant']);

  return (
    <Root
      class={badgeVariants({ variant: local.variant, class: local.class })}
      data-slot="badge"
      data-variant={local.variant}
      {...others}
    />
  );
};
