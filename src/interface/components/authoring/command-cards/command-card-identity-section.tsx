import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../card';
import { FormField } from '../../form-field';
import { Input } from '../../input';

export const CommandCardIdentitySection = (props: {
  card: Accessor<Card>;
  onChange: (card: Card) => void;
}): JSX.Element => {
  const update = (patch: Partial<Card>): void => {
    props.onChange({ ...props.card(), ...patch });
  };

  return (
    <UiCard>
      <CardHeader>
        <CardTitle>Identity</CardTitle>
        <CardDescription>Name, version, and initiative.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-3">
        <FormField label="Name" for="command-card-name">
          <Input
            id="command-card-name"
            value={props.card().name}
            onInput={(event) => {
              update({ name: event.currentTarget.value });
            }}
          />
        </FormField>
        <FormField label="Version" for="command-card-version">
          <Input
            id="command-card-version"
            value={props.card().version}
            onInput={(event) => {
              update({ version: event.currentTarget.value });
            }}
          />
        </FormField>
        <FormField label="Initiative" for="command-card-initiative">
          <Input
            id="command-card-initiative"
            type="number"
            min={1}
            max={4}
            value={props.card().initiative}
            onInput={(event) => {
              update({ initiative: Number(event.currentTarget.value) });
            }}
          />
        </FormField>
      </CardContent>
    </UiCard>
  );
};
