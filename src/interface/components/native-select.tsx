import { ChevronDown } from 'lucide-solid';
import type { ComponentProps, JSX } from 'solid-js';
import { cx } from '@interface/lib';
import { mergeProps, splitProps } from 'solid-js';

/** Zaidan vega — https://zaidan.carere.dev/r/kobalte/native-select.json */
export type NativeSelectProps = ComponentProps<'select'> & {
  size?: 'sm' | 'default';
};

export const NativeSelect = (props: NativeSelectProps): JSX.Element => {
  const mergedProps = mergeProps({ size: 'default' }, props);
  const [local, others] = splitProps(mergedProps, ['class', 'size']);

  return (
    <div
      class={cx(
        'group/native-select relative z-native-select-wrapper w-full has-[select:disabled]:opacity-50',
        local.class,
      )}
      data-slot="native-select-wrapper"
      data-size={local.size}
    >
      <select
        data-slot="native-select"
        data-size={local.size}
        class="z-native-select outline-none disabled:pointer-events-none disabled:cursor-not-allowed"
        {...others}
      />
      <ChevronDown
        class="pointer-events-none absolute z-native-select-icon select-none"
        data-slot="native-select-icon"
      />
    </div>
  );
};

export const NativeSelectOption = (
  props: ComponentProps<'option'>,
): JSX.Element => <option data-slot="native-select-option" {...props} />;

export const NativeSelectOptGroup = (
  props: ComponentProps<'optgroup'>,
): JSX.Element => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <optgroup
      data-slot="native-select-optgroup"
      class={cx(local.class)}
      {...others}
    />
  );
};
