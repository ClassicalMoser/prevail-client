import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import { UnitCardArmySection } from './unit-card-army-section';
import { UnitCardIdentitySection } from './unit-card-identity-section';
import { UnitCardStatsSection } from './unit-card-stats-section';
import { UnitCardTraitsSection } from './unit-card-traits-section';

export const UnitCardForm = (props: {
  unit: Accessor<UnitType>;
  onChange: (unit: UnitType) => void;
}): JSX.Element => (
  <div class="grid gap-6">
    <UnitCardIdentitySection unit={props.unit} onChange={props.onChange} />
    <UnitCardTraitsSection unit={props.unit} onChange={props.onChange} />
    <UnitCardStatsSection unit={props.unit} onChange={props.onChange} />
    <UnitCardArmySection unit={props.unit} onChange={props.onChange} />

    <div class="text-muted-foreground text-xs">
      <p class="text-sm font-medium">CommandCard ID</p>
      <p class="font-mono">{props.unit().id}</p>
    </div>
  </div>
);
