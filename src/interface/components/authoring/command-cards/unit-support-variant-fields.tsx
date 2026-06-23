import type { Trait, UnitSupport } from '@classicalmoser/prevail-rules/domain';
import { traits } from '@classicalmoser/prevail-rules/domain';
import type { JSX } from 'solid-js';
import { For } from 'solid-js';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { NativeSelect } from '../../native-select';

export const UnitSupportVariantFields = (props: {
  unitSupport: UnitSupport;
  onChange: (unitSupport: UnitSupport) => void;
}): JSX.Element => {
  if (props.unitSupport.supportType === 'trait') {
    return (
      <FormField label="Trait" for="unit-support-trait">
        <NativeSelect
          id="unit-support-trait"
          value={props.unitSupport.trait}
          onChange={(event) => {
            props.onChange({
              supportType: 'trait',
              trait: event.currentTarget.value as Trait,
              count: props.unitSupport.count,
            });
          }}
        >
          <For each={[...traits]}>
            {(trait) => <option value={trait}>{trait}</option>}
          </For>
        </NativeSelect>
      </FormField>
    );
  }

  if (props.unitSupport.supportType === 'unitType') {
    return (
      <FormField label="Unit type ID" for="unit-support-unit-type-id">
        <Input
          id="unit-support-unit-type-id"
          value={props.unitSupport.unitTypeId}
          onInput={(event) => {
            props.onChange({
              supportType: 'unitType',
              unitTypeId: event.currentTarget.value,
              count: props.unitSupport.count,
            });
          }}
        />
      </FormField>
    );
  }

  return null;
};
