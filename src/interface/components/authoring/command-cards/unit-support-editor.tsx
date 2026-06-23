import type { UnitSupport } from '@classicalmoser/prevail-rules/domain';
import type { JSX } from 'solid-js';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { NativeSelect } from '../../native-select';
import { UnitSupportVariantFields } from './unit-support-variant-fields';

export const UnitSupportEditor = (props: {
  unitSupport: UnitSupport;
  onChange: (unitSupport: UnitSupport) => void;
}): JSX.Element => (
  <div class="grid gap-4">
    <FormField label="Support type" for="unit-support-type">
      <NativeSelect
        id="unit-support-type"
        value={props.unitSupport.supportType}
        onChange={(event) => {
          const nextType = event.currentTarget
            .value as UnitSupport['supportType'];

          // Switching support type resets variant-specific fields.
          if (nextType === 'generic') {
            props.onChange({ supportType: 'generic', count: 1 });
            return;
          }

          if (nextType === 'trait') {
            props.onChange({
              supportType: 'trait',
              trait: 'formation',
              count: 1,
            });
            return;
          }

          props.onChange({
            supportType: 'unitType',
            unitTypeId: '',
            count: 1,
          });
        }}
      >
        <option value="generic">Generic</option>
        <option value="trait">Trait</option>
        <option value="unitType">Unit type</option>
      </NativeSelect>
    </FormField>

    <FormField label="Count" for="unit-support-count">
      <Input
        id="unit-support-count"
        type="number"
        min={1}
        max={4}
        value={props.unitSupport.count}
        onInput={(event) => {
          props.onChange({
            ...props.unitSupport,
            count: Number(event.currentTarget.value),
          } as UnitSupport);
        }}
      />
    </FormField>

    <UnitSupportVariantFields
      unitSupport={props.unitSupport}
      onChange={props.onChange}
    />
  </div>
);
