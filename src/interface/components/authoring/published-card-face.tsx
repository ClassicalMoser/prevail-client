import { cardSvgUrl, cx } from '@interface/lib';
import type { PublishedCardKind } from '@interface/lib';
import { mergeProps } from 'solid-js';
import type { JSX } from 'solid-js';

const sizeClass = {
  /** Dense roster / catalog scan */
  xs: 'w-16 sm:w-18',
  /** Seat hand / setup strip (must match --play-hand-face-width) */
  hand: 'w-36',
  /** Slightly larger catalog tiles */
  sm: 'w-20 sm:w-24',
  /** Hover / focus enlarge */
  md: 'w-40 sm:w-48',
} as const;

type PublishedCardFaceSize = keyof typeof sizeClass;

/** Published card face from the CDN (same asset path as the public gallery). */
const PublishedCardFace = (rawProps: {
  kind: PublishedCardKind;
  id: string;
  version: string;
  name: string;
  size?: PublishedCardFaceSize;
  /**
   * `chrome` — bordered tile (catalog).
   * `bare` — art only; the SVG already carries its own edge (play hand).
   */
  frame?: 'chrome' | 'bare';
  class?: string;
}): JSX.Element => {
  const props = mergeProps(
    { size: 'sm' as const, frame: 'chrome' as const },
    rawProps,
  );

  return (
    <div
      class={cx(
        props.frame === 'bare'
          ? 'bg-transparent'
          : 'overflow-hidden rounded-md border bg-card shadow-sm',
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

export { type PublishedCardFaceSize, PublishedCardFace };
