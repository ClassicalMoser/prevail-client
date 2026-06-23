import type { Trait, UnitSupport } from '@classicalmoser/prevail-rules/domain';
import { traits } from '@classicalmoser/prevail-rules/domain';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { NativeSelect, NativeSelectOption } from '../../native-select';

export const UnitSupportVariantFields = (props: {
  unitSupport: UnitSupport;
  onChange: (unitSupport: UnitSupport) => void;
}): JSX.Element => (
  <>
    <Show
      when={
        props.unitSupport.supportType === 'trait'
          ? props.unitSupport
          : undefined
      }
    >
      {(unitSupport) => (
        <FormField label="Trait" for="unit-support-trait">
          <NativeSelect
            id="unit-support-trait"
            value={unitSupport().trait}
            onChange={(event) => {
              props.onChange({
                ...unitSupport(),
                trait: event.currentTarget.value as Trait,
              });
            }}
          >
            <For each={[...traits]}>
              {(trait) => (
                <NativeSelectOption value={trait}>{trait}</NativeSelectOption>
              )}
            </For>
          </NativeSelect>
        </FormField>
      )}
    </Show>

    <Show
      when={
        props.unitSupport.supportType === 'unitType'
          ? props.unitSupport
          : undefined
      }
    >
      {(unitSupport) => (
        <FormField label="Unit type ID" for="unit-support-unit-type-id">
          <Input
            id="unit-support-unit-type-id"
            value={unitSupport().unitTypeId}
            onInput={(event) => {
              props.onChange({
                ...unitSupport(),
                unitTypeId: event.currentTarget.value,
              });
            }}
          />
        </FormField>
      )}
    </Show>
  </>
);
