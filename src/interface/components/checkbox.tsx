import {
  Control as CheckboxControl,
  Indicator as CheckboxIndicator,
  Input as CheckboxInput,
  Label as CheckboxLabelPrimitive,
  Root as CheckboxRoot,
} from '@kobalte/core/checkbox';
import type {
  CheckboxLabelProps as KobalteCheckboxLabelProps,
  CheckboxRootProps,
} from '@kobalte/core/checkbox';
import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import { CheckIcon } from 'lucide-solid';
import type { ComponentProps, JSX, ValidComponent } from 'solid-js';
import { cx } from '@interface/lib';
import { splitProps } from 'solid-js';

/** Zaidan vega — https://zaidan.carere.dev/r/kobalte/checkbox.json */
export type CheckboxProps<T extends ValidComponent = 'div'> = PolymorphicProps<
  T,
  CheckboxRootProps<T>
> &
  Pick<ComponentProps<T>, 'class'>;

export const Checkbox = <T extends ValidComponent = 'div'>(
  props: CheckboxProps<T>,
): JSX.Element => {
  const [local, others] = splitProps(props as CheckboxProps, ['class', 'id']);

  return (
    <CheckboxRoot
      data-slot="checkbox"
      class="peer data-disabled:cursor-not-allowed data-disabled:opacity-50"
      {...others}
    >
      <CheckboxInput
        data-slot="checkbox-input"
        class="peer sr-only"
        id={local.id}
      />
      <CheckboxControl
        class={cx(
          'z-checkbox relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2',
          local.class,
        )}
      >
        <CheckboxIndicator
          data-slot="checkbox-indicator"
          class="z-checkbox-indicator grid place-content-center text-current transition-none"
        >
          <CheckIcon class="size-3.5" />
        </CheckboxIndicator>
      </CheckboxControl>
    </CheckboxRoot>
  );
};

export type CheckboxLabelProps<T extends ValidComponent = 'label'> =
  PolymorphicProps<T, KobalteCheckboxLabelProps<T>> &
    Pick<ComponentProps<T>, 'class' | 'children'>;

export const CheckboxLabel = <T extends ValidComponent = 'label'>(
  props: CheckboxLabelProps<T>,
): JSX.Element => {
  const [local, others] = splitProps(props as CheckboxLabelProps, [
    'class',
    'children',
  ]);

  return (
    <CheckboxLabelPrimitive
      data-slot="checkbox-label"
      class={cx(
        'text-sm leading-none font-medium peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-70',
        local.class,
      )}
      {...others}
    >
      {local.children}
    </CheckboxLabelPrimitive>
  );
};
