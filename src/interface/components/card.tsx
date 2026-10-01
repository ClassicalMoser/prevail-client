import { mergeProps, splitProps } from 'solid-js';
import type { ComponentProps, JSX } from 'solid-js';
import { cx } from '@interface/lib';

/** Zaidan vega — https://zaidan.carere.dev/r/kobalte/card.json */
type CardProps = ComponentProps<'div'> & { size?: 'default' | 'sm' };

const Card = (props: CardProps): JSX.Element => {
  const mergedProps = mergeProps({ size: 'default' } as const, props);
  const [local, others] = splitProps(mergedProps, ['class', 'size']);

  return (
    <div
      data-slot="card"
      data-size={local.size}
      class={cx('group/card z-card flex flex-col', local.class)}
      {...others}
    />
  );
};

type CardHeaderProps = ComponentProps<'div'>;

const CardHeader = (props: CardHeaderProps): JSX.Element => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <div
      data-slot="card-header"
      class={cx(
        'group/card-header @container/card-header z-card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]',
        local.class,
      )}
      {...others}
    />
  );
};

type CardTitleProps = ComponentProps<'div'>;

const CardTitle = (props: CardTitleProps): JSX.Element => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <div
      data-slot="card-title"
      class={cx('z-card-title z-font-heading', local.class)}
      {...others}
    />
  );
};

type CardDescriptionProps = ComponentProps<'div'>;

const CardDescription = (props: CardDescriptionProps): JSX.Element => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <div
      data-slot="card-description"
      class={cx('z-card-description', local.class)}
      {...others}
    />
  );
};

type CardActionProps = ComponentProps<'div'>;

const CardAction = (props: CardActionProps): JSX.Element => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <div
      data-slot="card-action"
      class={cx(
        'z-card-action col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        local.class,
      )}
      {...others}
    />
  );
};

type CardContentProps = ComponentProps<'div'>;

const CardContent = (props: CardContentProps): JSX.Element => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <div
      data-slot="card-content"
      class={cx('z-card-content', local.class)}
      {...others}
    />
  );
};

type CardFooterProps = ComponentProps<'div'>;

const CardFooter = (props: CardFooterProps): JSX.Element => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <div
      data-slot="card-footer"
      class={cx('z-card-footer flex items-center', local.class)}
      {...others}
    />
  );
};

export {
  type CardProps,
  Card,
  type CardHeaderProps,
  CardHeader,
  type CardTitleProps,
  CardTitle,
  type CardDescriptionProps,
  CardDescription,
  type CardActionProps,
  CardAction,
  type CardContentProps,
  CardContent,
  type CardFooterProps,
  CardFooter,
};
