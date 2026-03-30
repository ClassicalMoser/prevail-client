import type { UnitFacing } from "@classicalmoser/prevail-rules/domain";
import "./unit.css";

export const UnitComponent = (props: {
  facing: UnitFacing;
  imageSrc: string;
}) => {
  return (
    <div class={`unit-component facing-${props.facing}`}>
      <img src={props.imageSrc} alt="Unit" />
    </div>
  );
};
