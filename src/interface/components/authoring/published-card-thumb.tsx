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

  const ThumbBody = (): JSX.Element => (
    <>
      <PublishedCardFace
        kind={props.kind}
        id={props.id}
        version={props.version}
        name={props.name}
        size={props.size ?? 'xs'}
      />
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
