import type {
  Modifier,
  StatModifier,
} from '@classicalmoser/prevail-rules/domain';
import { statModifiers } from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { Button } from '../button';
import { FormField } from '../form-field';
import { Input } from '../input';
import { NativeSelect } from '../native-select';

export const ModifierListEditor = (props: {
  idPrefix: string;
  modifiers: Accessor<Modifier[]>;
  onChange: (modifiers: Modifier[]) => void;
}): JSX.Element => {
  const updateModifier = (index: number, patch: Partial<Modifier>): void => {
    props.onChange(
      props
        .modifiers()
        .map((modifier, modifierIndex) =>
          modifierIndex === index ? { ...modifier, ...patch } : modifier,
        ),
    );
  };

  const addModifier = (): void => {
    props.onChange([...props.modifiers(), { type: 'attack', value: 1 }]);
  };

  const removeModifier = (index: number): void => {
    props.onChange(
      props.modifiers().filter((_, modifierIndex) => modifierIndex !== index),
    );
  };

  return (
    <div class="flex flex-col gap-3">
      <Show
        when={props.modifiers().length > 0}
        fallback={<p class="text-muted-foreground text-sm">No modifiers.</p>}
      >
        <For each={props.modifiers()}>
          {(modifier, index) => (
            <div class="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto]">
              <FormField
                label="Type"
                for={`${props.idPrefix}-modifier-type-${index()}`}
              >
                <NativeSelect
                  id={`${props.idPrefix}-modifier-type-${index()}`}
                  value={modifier.type}
                  onChange={(event) => {
                    updateModifier(index(), {
                      type: event.currentTarget.value as StatModifier,
                    });
                  }}
                >
                  <For each={[...statModifiers]}>
                    {(statModifier) => (
                      <option value={statModifier}>{statModifier}</option>
                    )}
                  </For>
                </NativeSelect>
              </FormField>
              <FormField
                label="Value"
                for={`${props.idPrefix}-modifier-value-${index()}`}
              >
                <Input
                  id={`${props.idPrefix}-modifier-value-${index()}`}
                  type="number"
                  min={-2}
                  max={2}
                  value={modifier.value}
                  onInput={(event) => {
                    updateModifier(index(), {
                      value: Number(event.currentTarget.value),
                    });
                  }}
                />
              </FormField>
              <div class="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    removeModifier(index());
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </For>
      </Show>
      <div>
        <Button type="button" variant="outline" size="sm" onClick={addModifier}>
          Add Modifier
        </Button>
      </div>
    </div>
  );
};
