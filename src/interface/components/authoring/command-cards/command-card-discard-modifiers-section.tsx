import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { JSX } from 'solid-js';
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../card';
import { ModifierListEditor } from '../modifier-list-editor';

export const CommandCardDiscardModifiersSection = (props: {
  card: Card;
  onChange: (card: Card) => void;
}): JSX.Element => (
  <UiCard>
    <CardHeader>
      <CardTitle>Discard modifiers</CardTitle>
      <CardDescription>
        Modifiers the player can discard from this card.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ModifierListEditor
        idPrefix="command-card"
        modifiers={props.card.modifiers}
        onChange={(modifiers) => {
          props.onChange({ ...props.card, modifiers });
        }}
      />
    </CardContent>
  </UiCard>
);
