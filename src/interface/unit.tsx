import type { UnitFacing } from '@classicalmoser/prevail-rules/domain';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import './unit.css';

export const UnitComponent = (props: {
  facing: UnitFacing;
  imageSrc: string | undefined;
  label: string;
  pending?: boolean;
  onHoverStart?: (el: HTMLElement) => void;
  onHoverEnd?: () => void;
}): JSX.Element => (
  <div
    class={`unit-component facing-${props.facing}${props.pending === true ? ' unit-component--pending' : ''}`}
    onMouseEnter={(event) => {
      props.onHoverStart?.(event.currentTarget);
    }}
    onMouseLeave={() => {
      props.onHoverEnd?.();
    }}
  >
    <Show
      when={props.imageSrc}
      fallback={
        <span class="unit-placeholder bg-background/80 text-foreground block px-1 py-0.5 text-center text-xs leading-tight">
          {props.label}
        </span>
      }
    >
      {(src) => <img src={src()} alt={props.label} />}
    </Show>
  </div>
);
