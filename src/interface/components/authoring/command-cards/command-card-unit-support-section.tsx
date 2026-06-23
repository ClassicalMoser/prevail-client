import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { JSX } from 'solid-js';
import {
  Card as UiCard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../card';
import { UnitSupportEditor } from './unit-support-editor';

export const CommandCardUnitSupportSection = (props: {
  card: Card;
  onChange: (card: Card) => void;
}): JSX.Element => (
  <UiCard>
    <CardHeader>
      <CardTitle>Unit support</CardTitle>
      <CardDescription>Units this card can support.</CardDescription>
    </CardHeader>
    <CardContent>
      <UnitSupportEditor
        unitSupport={props.card.unitSupport}
        onChange={(unitSupport) => {
          props.onChange({ ...props.card, unitSupport });
        }}
      />
    </CardContent>
  </UiCard>
);
