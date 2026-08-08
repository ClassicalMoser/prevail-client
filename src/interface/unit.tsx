import type { UnitFacing } from '@classicalmoser/prevail-rules/domain';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import './unit.css';

export const UnitComponent = (props: {
  facing: UnitFacing;
  imageSrc: string | undefined;
  label: string;
}): JSX.Element => (
  <div class={`unit-component facing-${props.facing}`}>
    <Show
      when={props.imageSrc}
      fallback={
        <span class="unit-placeholder bg-background/80 text-foreground block px-1 py-0.5 text-center text-[0.65rem] leading-tight">
          {props.label}
        </span>
      }
    >
      {(src) => <img src={src()} alt={props.label} />}
    </Show>
  </div>
);
