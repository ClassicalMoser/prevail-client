import type { PublishedCardKind } from '@interface/lib';
import { cx } from '@interface/lib';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import type { PublishedCardFaceSize } from './published-card-face';
import { PublishedCardFace } from './published-card-face';

/**
 * Compact card tile with a larger preview on hover / keyboard focus.
 * Pass {@link onActivate} to make the whole thumb a select/add control.
 *
 * Enlarge is the card face only (no chrome). Parent Cards must allow overflow
 * (`.z-card` defaults to `overflow-hidden`).
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
  const body = (
    <>
      <PublishedCardFace
        kind={props.kind}
        id={props.id}
        version={props.version}
        name={props.name}
        size={props.size ?? 'xs'}
      />
      <div
        class="pointer-events-none absolute bottom-[calc(100%+0.35rem)] left-1/2 z-50 hidden w-max -translate-x-1/2 group-hover/thumb:block group-focus-within/thumb:block"
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
    <Show
      when={props.onActivate !== undefined}
      fallback={
        <div class="group/thumb relative flex w-fit max-w-full flex-col gap-1 overflow-visible">
          {body}
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
        onClick={() => {
          props.onActivate?.();
        }}
      >
        {body}
      </button>
    </Show>
  );
};
