import type { Card } from '@classicalmoser/prevail-rules/domain';
import {
  commandSizes,
  commandTypes,
} from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import { For } from 'solid-js';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { NativeSelect } from '../../native-select';

export const CommandCardCommandFields = (props: {
  command: Accessor<Card['command']>;
  onChange: (command: Card['command']) => void;
}): JSX.Element => {
  const update = (patch: Partial<Card['command']>): void => {
    props.onChange({ ...props.command(), ...patch });
  };

  return (
    <div class="grid gap-4 sm:grid-cols-3">
      <FormField label="Size" for="command-size">
        <NativeSelect
          id="command-size"
          value={props.command().size}
          onChange={(event) => {
            update({
              size: event.currentTarget.value as Card['command']['size'],
            });
          }}
        >
          <For each={[...commandSizes]}>
            {(size) => <option value={size}>{size}</option>}
          </For>
        </NativeSelect>
      </FormField>
      <FormField label="Type" for="command-type">
        <NativeSelect
          id="command-type"
          value={props.command().type}
          onChange={(event) => {
            update({
              type: event.currentTarget.value as Card['command']['type'],
            });
          }}
        >
          <For each={[...commandTypes]}>
            {(type) => <option value={type}>{type}</option>}
          </For>
        </NativeSelect>
      </FormField>
      <FormField label="Number" for="command-number">
        <Input
          id="command-number"
          type="number"
          min={1}
          max={10}
          value={props.command().number}
          onInput={(event) => {
            update({ number: Number(event.currentTarget.value) });
          }}
        />
      </FormField>
    </div>
  );
};
