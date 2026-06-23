import type { VariantProps } from 'cva';
import type { ComponentProps, JSX } from 'solid-js';
import { cva } from '@interface/lib';
import { splitProps } from 'solid-js';

export const badgeVariants = cva({
  base: [
    'inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1',
    'transition-[color,box-shadow] overflow-hidden',
    '[&>svg]:pointer-events-none [&>svg]:size-3',
  ],
  variants: {
    variant: {
      default:
        'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
      secondary:
        'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
      destructive:
        'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
      outline:
        'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type BadgeProps = ComponentProps<'span'> &
  VariantProps<typeof badgeVariants>;

export const Badge = (props: BadgeProps): JSX.Element => {
  const [local, rest] = splitProps(props, ['class', 'variant']);

  return (
    <span
      data-slot="badge"
      class={badgeVariants({
        variant: local.variant,
        class: local.class,
      })}
      {...rest}
    />
  );
};
