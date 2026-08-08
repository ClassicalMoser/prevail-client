import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../card';
import { ModifierListEditor } from '../modifier-list-editor';
import { RestrictionsEditor } from '../restrictions-editor';
import { CommandCardCommandFields } from './command-card-command-fields';

export const CommandCardCommandSection = (props: {
  card: Accessor<CommandCard>;
  onChange: (card: CommandCard) => void;
}): JSX.Element => {
  const updateCommand = (command: CommandCard['command']): void => {
    props.onChange({ ...props.card(), command });
  };

  return (
    <UiCard>
      <CardHeader>
        <CardTitle>Command</CardTitle>
        <CardDescription>Primary command issued by this card.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-6">
        <CommandCardCommandFields
          command={() => props.card().command}
          onChange={updateCommand}
        />

        <div>
          <p class="mb-3 text-sm font-medium">Command restrictions</p>
          <RestrictionsEditor
            idPrefix="command"
            restrictions={() => props.card().command.restrictions}
            onChange={(restrictions) => {
              updateCommand({ ...props.card().command, restrictions });
            }}
          />
        </div>

        <div>
          <p class="mb-3 text-sm font-medium">Command modifiers</p>
          <ModifierListEditor
            idPrefix="command"
            modifiers={() => props.card().command.modifiers}
            onChange={(modifiers) => {
              updateCommand({ ...props.card().command, modifiers });
            }}
          />
        </div>
      </CardContent>
    </UiCard>
  );
};
