import type { PublishedCardKind } from '@interface/lib';
import type { Accessor, JSX } from 'solid-js';
import { createMemo, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import { PublishedCardFace } from './published-card-face';

/** Approximate md face height (w-48 × 5/7) plus gap — used to flip below when clipped. */
const PREVIEW_HEIGHT_PX = 300;

/**
 * Fixed-position enlarged card face anchored to a DOMRect.
 * Portaled to `document.body` so overflow ancestors cannot clip it.
 */
export function AnchoredPublishedCardPreview(props: {
  kind: PublishedCardKind;
  id: string;
  version: string;
  name: string;
  anchor: Accessor<DOMRect | undefined>;
}): JSX.Element {
  const placement = createMemo(() => {
    const rect = props.anchor();
    if (!rect) {
      return null;
    }
    const showAbove = rect.top >= PREVIEW_HEIGHT_PX;
    return {
      left: rect.left + rect.width / 2,
      top: showAbove ? rect.top : rect.bottom,
      transform: showAbove
        ? 'translate(-50%, calc(-100% - 0.35rem))'
        : 'translate(-50%, 0.35rem)',
    };
  });

  return (
    <Show when={placement()}>
      {(pos) => (
        <Portal>
          <div
            class="pointer-events-none fixed z-9999"
            style={{
              left: `${pos().left}px`,
              top: `${pos().top}px`,
              transform: pos().transform,
            }}
            role="presentation"
          >
            <PublishedCardFace
              kind={props.kind}
              id={props.id}
              version={props.version}
              name={props.name}
              size="md"
              class="shadow-lg"
            />
          </div>
        </Portal>
      )}
    </Show>
  );
}
