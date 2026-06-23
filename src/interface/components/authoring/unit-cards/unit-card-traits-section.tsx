import type { Trait, UnitType } from '@classicalmoser/prevail-rules/domain';
import { traits } from '@classicalmoser/prevail-rules/domain';
import type { JSX } from 'solid-js';
import { For } from 'solid-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../card';
import { Checkbox } from '../../checkbox';

export const UnitCardTraitsSection = (props: {
  unit: UnitType;
  onChange: (unit: UnitType) => void;
}): JSX.Element => {
  const toggleTrait = (trait: Trait, checked: boolean): void => {
    const currentTraits = props.unit.traits;
    const nextTraits = checked
      ? [...currentTraits, trait]
      : currentTraits.filter((currentTrait) => currentTrait !== trait);

    props.onChange({ ...props.unit, traits: nextTraits });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traits</CardTitle>
        <CardDescription>Unit capabilities and formation type.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <For each={[...traits]}>
            {(trait) => (
              <label class="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={props.unit.traits.includes(trait)}
                  onChange={(event) => {
                    toggleTrait(trait, event.currentTarget.checked);
                  }}
                />
                <span class="capitalize">{trait}</span>
              </label>
            )}
          </For>
        </div>
      </CardContent>
    </Card>
  );
};
