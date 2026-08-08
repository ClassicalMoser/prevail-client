import type { UnitStats, UnitType } from '@classicalmoser/prevail-rules/domain';
import { unitStatNames } from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import { For } from 'solid-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@interface/card';
import { FormField } from '@interface/form-field';
import { Input } from '@interface/input';

export const UnitCardStatsSection = (props: {
  unit: Accessor<UnitType>;
  onChange: (unit: UnitType) => void;
}): JSX.Element => {
  const updateStat = (statName: keyof UnitStats, value: number): void => {
    props.onChange({
      ...props.unit(),
      stats: {
        ...props.unit().stats,
        [statName]: value,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stats</CardTitle>
        <CardDescription>Combat and movement values.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <For each={[...unitStatNames]}>
          {(statName) => (
            <FormField label={statName} for={`unit-stat-${statName}`}>
              <Input
                id={`unit-stat-${statName}`}
                type="number"
                value={props.unit().stats[statName]}
                onInput={(event) => {
                  updateStat(statName, Number(event.currentTarget.value));
                }}
              />
            </FormField>
          )}
        </For>
      </CardContent>
    </Card>
  );
};
