import type { ComponentProps, JSX } from 'solid-js';
import { cx } from '@interface/lib';
import { splitProps } from 'solid-js';

export type CardProps = ComponentProps<'div'> & {
  class?: string;
};

export const Card = (props: CardProps): JSX.Element => {
  const [local, rest] = splitProps(props, ['class']);

  return (
    <div
      data-slot="card"
      class={cx(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        local.class,
      )}
      {...rest}
    />
  );
};

export const CardHeader = (props: CardProps): JSX.Element => {
  const [local, rest] = splitProps(props, ['class']);

  return (
    <div
      data-slot="card-header"
      class={cx(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        local.class,
      )}
      {...rest}
    />
  );
};

export const CardTitle = (props: CardProps): JSX.Element => {
  const [local, rest] = splitProps(props, ['class']);

  return (
    <div
      data-slot="card-title"
      class={cx('leading-none font-semibold', local.class)}
      {...rest}
    />
  );
};

export const CardDescription = (props: CardProps): JSX.Element => {
  const [local, rest] = splitProps(props, ['class']);

  return (
    <div
      data-slot="card-description"
      class={cx('text-muted-foreground text-sm', local.class)}
      {...rest}
    />
  );
};

export const CardContent = (props: CardProps): JSX.Element => {
  const [local, rest] = splitProps(props, ['class']);

  return (
    <div data-slot="card-content" class={cx('px-6', local.class)} {...rest} />
  );
};

export const CardFooter = (props: CardProps): JSX.Element => {
  const [local, rest] = splitProps(props, ['class']);

  return (
    <div
      data-slot="card-footer"
      class={cx('flex items-center px-6 [.border-t]:pt-6', local.class)}
      {...rest}
    />
  );
};
