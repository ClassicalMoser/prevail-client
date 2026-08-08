import { cardSvgUrl } from '@interface/lib/cardSvgUrl';
import type { PublishedCardKind } from '@interface/lib/cardSvgUrl';
import { cx } from '@interface/lib';
import type { JSX } from 'solid-js';
import { mergeProps } from 'solid-js';

const sizeClass = {
  /** Dense roster / catalog scan */
  xs: 'w-16 sm:w-[4.5rem]',
  /** Slightly larger catalog tiles */
  sm: 'w-20 sm:w-24',
  /** Hover / focus enlarge */
  md: 'w-40 sm:w-48',
} as const;

export type PublishedCardFaceSize = keyof typeof sizeClass;

/** Published card face from the CDN (same asset path as the public gallery). */
export const PublishedCardFace = (rawProps: {
  kind: PublishedCardKind;
  id: string;
  version: string;
  name: string;
  size?: PublishedCardFaceSize;
  class?: string;
}): JSX.Element => {
  const props = mergeProps({ size: 'sm' as const }, rawProps);

  return (
    <div
      class={cx(
        'overflow-hidden rounded-md border bg-card shadow-sm',
        sizeClass[props.size],
        props.class,
      )}
    >
      <img
        src={cardSvgUrl(props.kind, props.id, props.version)}
        alt={props.name}
        loading="lazy"
        class="aspect-5/7 w-full object-contain"
      />
    </div>
  );
};
