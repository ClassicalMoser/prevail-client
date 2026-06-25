import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../card';
import { FormField } from '../../form-field';
import { Input } from '../../input';

export const UnitCardArmySection = (props: {
  unit: Accessor<UnitType>;
  onChange: (unit: UnitType) => void;
}): JSX.Element => {
  const update = (patch: Partial<UnitType>): void => {
    props.onChange({ ...props.unit(), ...patch });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Army</CardTitle>
        <CardDescription>Recruitment and rout behavior.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-3">
        <FormField label="Cost" for="unit-cost">
          <Input
            id="unit-cost"
            type="number"
            min={5}
            max={100}
            value={props.unit().cost}
            onInput={(event) => {
              update({ cost: Number(event.currentTarget.value) });
            }}
          />
        </FormField>
        <FormField label="Army limit" for="unit-limit">
          <Input
            id="unit-limit"
            type="number"
            min={1}
            max={20}
            value={props.unit().limit}
            onInput={(event) => {
              update({ limit: Number(event.currentTarget.value) });
            }}
          />
        </FormField>
        <FormField label="Rout penalty" for="unit-rout-penalty">
          <Input
            id="unit-rout-penalty"
            type="number"
            min={0}
            max={5}
            value={props.unit().routPenalty}
            onInput={(event) => {
              update({ routPenalty: Number(event.currentTarget.value) });
            }}
          />
        </FormField>
      </CardContent>
    </Card>
  );
};
