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

export const UnitCardIdentitySection = (props: {
  unit: Accessor<UnitType>;
  onChange: (unit: UnitType) => void;
}): JSX.Element => {
  const update = (patch: Partial<UnitType>): void => {
    props.onChange({ ...props.unit(), ...patch });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity</CardTitle>
        <CardDescription>Name and version metadata.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" for="unit-name">
          <Input
            id="unit-name"
            value={props.unit().name}
            onInput={(event) => {
              update({ name: event.currentTarget.value });
            }}
          />
        </FormField>
        <FormField label="Version" for="unit-version">
          <Input
            id="unit-version"
            value={props.unit().version}
            onInput={(event) => {
              update({ version: event.currentTarget.value });
            }}
          />
        </FormField>
      </CardContent>
    </Card>
  );
};
