import type { PublishedCardKind } from '@interface/lib';
import { cx } from '@interface/lib';
import type { JSX } from 'solid-js';
import { createSignal, onCleanup, Show } from 'solid-js';
import { AnchoredPublishedCardPreview } from './anchored-published-card-preview';
import type { PublishedCardFaceSize } from './published-card-face';
import { PublishedCardFace } from './published-card-face';

/**
 * Compact card tile with a larger preview on hover / keyboard focus.
 * Pass {@link onActivate} to make the whole thumb a select/add control.
 *
 * Enlarge is portaled so overflow parents (play rail, hand strip) cannot clip it.
 */
export const PublishedCardThumb = (props: {
  kind: PublishedCardKind;
  id: string;
  version: string;
  name: string;
  meta?: string;
  size?: PublishedCardFaceSize;
  /** Where the name caption sits relative to the face (default below). */
  captionPlacement?: 'above' | 'below';
  /** Hide name/meta caption (face art already carries the title). */
  hideCaption?: boolean;
  /** Skip portaled enlarge — use when the parent lifts the face itself (hand peek). */
  disableHoverPreview?: boolean;
  /** Face frame; use `bare` in the play hand so SVG edges aren’t doubled. */
  frame?: 'chrome' | 'bare';
  disabled?: boolean;
  selected?: boolean;
  onActivate?: () => void;
  children?: JSX.Element;
}): JSX.Element => {
  const [anchor, setAnchor] = createSignal<DOMRect | undefined>();
  let dismissScroll: (() => void) | undefined;

  const clearPreview = (): void => {
    setAnchor(undefined);
    dismissScroll?.();
    dismissScroll = undefined;
  };

  const showPreview = (el: Element): void => {
    if (props.disableHoverPreview === true) {
      return;
    }
    clearPreview();
    setAnchor(el.getBoundingClientRect());
    const dismiss = (): void => {
      clearPreview();
    };
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);
    dismissScroll = () => {
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  };

  onCleanup(clearPreview);

  const Caption = (): JSX.Element => (
    <>
      <p
        class="max-w-16 truncate text-[0.65rem] font-medium leading-tight sm:max-w-18"
        title={props.name}
      >
        {props.name}
      </p>
      <Show when={props.meta}>
        {(meta) => (
          <p
            class="text-muted-foreground max-w-16 truncate text-[0.6rem] leading-tight sm:max-w-18"
            title={meta()}
          >
            {meta()}
          </p>
        )}
      </Show>
    </>
  );

  const ThumbBody = (): JSX.Element => (
    <>
      <Show when={!props.hideCaption && props.captionPlacement === 'above'}>
        <Caption />
      </Show>
      <PublishedCardFace
        kind={props.kind}
        id={props.id}
        version={props.version}
        name={props.name}
        size={props.size ?? 'xs'}
        frame={props.frame}
      />
      <Show when={!props.hideCaption && props.captionPlacement !== 'above'}>
        <Caption />
      </Show>
      {props.children}
    </>
  );

  return (
    <>
      <Show
        when={props.onActivate !== undefined}
        fallback={
          <div
            class="group/thumb relative flex w-fit max-w-full flex-col gap-1 overflow-visible"
            onMouseEnter={(event) => {
              showPreview(event.currentTarget);
            }}
            onMouseLeave={clearPreview}
            onFocusIn={(event) => {
              showPreview(event.currentTarget);
            }}
            onFocusOut={clearPreview}
          >
            <ThumbBody />
          </div>
        }
      >
        <button
          type="button"
          disabled={props.disabled}
          aria-pressed={props.selected === true}
          class={cx(
            'group/thumb focus-visible:ring-ring relative flex w-fit max-w-full flex-col gap-1 overflow-visible rounded-md text-left outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-40',
            props.selected === true
              ? 'ring-ring ring-2'
              : 'hover:ring-ring hover:ring-2',
          )}
          onMouseEnter={(event) => {
            showPreview(event.currentTarget);
          }}
          onMouseLeave={clearPreview}
          onFocusIn={(event) => {
            showPreview(event.currentTarget);
          }}
          onFocusOut={clearPreview}
          onClick={() => {
            props.onActivate?.();
          }}
        >
          <ThumbBody />
        </button>
      </Show>
      <AnchoredPublishedCardPreview
        kind={props.kind}
        id={props.id}
        version={props.version}
        name={props.name}
        anchor={anchor}
      />
    </>
  );
};
