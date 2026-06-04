import type { UnitFacing } from '@classicalmoser/prevail-rules/domain';
import type { JSX } from 'solid-js';
import './unit.css';

export const UnitComponent = (props: {
  facing: UnitFacing;
  imageSrc: string;
}): JSX.Element => (
  <div class={`unit-component facing-${props.facing}`}>
    <img src={props.imageSrc} alt="Unit" />
  </div>
);
