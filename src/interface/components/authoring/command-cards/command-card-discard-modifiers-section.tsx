import type {
  CommandCard,
  StatModifier,
} from '@classicalmoser/prevail-rules/domain';
import { statModifiers } from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import { For } from 'solid-js';
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../card';
import { Checkbox } from '../../checkbox';

export const CommandCardDiscardModifiersSection = (props: {
  card: Accessor<CommandCard>;
  onChange: (card: CommandCard) => void;
}): JSX.Element => {
  const toggleModifier = (stat: StatModifier, checked: boolean): void => {
    const current = props.card().modifiers;

    if (checked) {
      if (current.length >= 2 || current.includes(stat)) {
        return;
      }

      props.onChange({ ...props.card(), modifiers: [...current, stat] });
      return;
    }

    props.onChange({
      ...props.card(),
      modifiers: current.filter((currentStat) => currentStat !== stat),
    });
  };

  return (
    <UiCard>
      <CardHeader>
        <CardTitle>Commit modifiers</CardTitle>
        <CardDescription>
          The stat or stats this card boosts by one on commit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <For each={[...statModifiers]}>
            {(stat) => (
              <label class="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={props.card().modifiers.includes(stat)}
                  disabled={
                    props.card().modifiers.length >= 2 &&
                    !props.card().modifiers.includes(stat)
                  }
                  onChange={(checked) => {
                    toggleModifier(stat, checked);
                  }}
                />
                <span class="capitalize">{stat}</span>
              </label>
            )}
          </For>
        </div>
      </CardContent>
    </UiCard>
  );
};
