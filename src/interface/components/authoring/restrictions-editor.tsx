import type { Restrictions, Trait } from '@classicalmoser/prevail-rules/domain';
import { traits } from '@classicalmoser/prevail-rules/domain';
import type { JSX } from 'solid-js';
import { For } from 'solid-js';
import { Checkbox } from '../checkbox';
import { FormField } from '../form-field';
import { Input } from '../input';

export const RestrictionsEditor = (props: {
  idPrefix: string;
  restrictions: Restrictions;
  onChange: (restrictions: Restrictions) => void;
}): JSX.Element => {
  const toggleTrait = (trait: Trait, checked: boolean): void => {
    const currentTraits = props.restrictions.traitRestrictions;
    const nextTraits = checked
      ? [...currentTraits, trait]
      : currentTraits.filter((currentTrait) => currentTrait !== trait);

    props.onChange({
      ...props.restrictions,
      traitRestrictions: nextTraits,
    });
  };

  return (
    <div class="grid gap-4">
      <FormField
        label="Inspiration range"
        for={`${props.idPrefix}-inspiration-range`}
        description="Leave blank for no range restriction."
      >
        <Input
          id={`${props.idPrefix}-inspiration-range`}
          type="number"
          min={0}
          max={10}
          value={props.restrictions.inspirationRangeRestriction ?? ''}
          onInput={(event) => {
            const rawValue = event.currentTarget.value;
            props.onChange({
              ...props.restrictions,
              inspirationRangeRestriction:
                rawValue === '' ? undefined : Number(rawValue),
            });
          }}
        />
      </FormField>

      <div class="flex flex-col gap-2">
        <p class="text-sm font-medium">Trait restrictions</p>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <For each={[...traits]}>
            {(trait) => (
              <label class="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={props.restrictions.traitRestrictions.includes(trait)}
                  onChange={(event) => {
                    toggleTrait(trait, event.currentTarget.checked);
                  }}
                />
                <span class="capitalize">{trait}</span>
              </label>
            )}
          </For>
        </div>
      </div>

      <FormField
        label="Unit type restrictions"
        for={`${props.idPrefix}-unit-restrictions`}
        description="Comma-separated unit type UUIDs."
      >
        <Input
          id={`${props.idPrefix}-unit-restrictions`}
          value={props.restrictions.unitRestrictions.join(', ')}
          onInput={(event) => {
            const rawValue = event.currentTarget.value.trim();
            props.onChange({
              ...props.restrictions,
              unitRestrictions:
                rawValue === ''
                  ? []
                  : rawValue
                      .split(',')
                      .map((entry) => entry.trim())
                      .filter((entry) => entry.length > 0),
            });
          }}
        />
      </FormField>
    </div>
  );
};
