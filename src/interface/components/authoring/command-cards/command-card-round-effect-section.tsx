import type { Card } from '@classicalmoser/prevail-rules/domain';
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
import {
  emptyRoundEffect,
  emptyRoundEffectRestrictions,
} from './round-effect-defaults';

export const CommandCardRoundEffectSection = (props: {
  card: Accessor<Card>;
  onChange: (card: Card) => void;
}): JSX.Element => {
  // Cards may omit roundEffect until the author edits this section.
  const withRoundEffect = (): NonNullable<Card['roundEffect']> =>
    props.card().roundEffect ?? emptyRoundEffect();

  const updateRoundEffect = (
    patch: Partial<NonNullable<Card['roundEffect']>>,
  ): void => {
    props.onChange({
      ...props.card(),
      roundEffect: { ...withRoundEffect(), ...patch },
    });
  };

  return (
    <UiCard>
      <CardHeader>
        <CardTitle>Round effect</CardTitle>
        <CardDescription>Passive effect for the round.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-6">
        <div>
          <p class="mb-3 text-sm font-medium">Round effect restrictions</p>
          <RestrictionsEditor
            idPrefix="round-effect"
            restrictions={() =>
              props.card().roundEffect?.restrictions ??
              emptyRoundEffectRestrictions()
            }
            onChange={(restrictions) => {
              updateRoundEffect({ restrictions });
            }}
          />
        </div>
        <div>
          <p class="mb-3 text-sm font-medium">Round effect modifiers</p>
          <ModifierListEditor
            idPrefix="round-effect"
            modifiers={() => props.card().roundEffect?.modifiers ?? []}
            onChange={(modifiers) => {
              updateRoundEffect({ modifiers });
            }}
          />
        </div>
      </CardContent>
    </UiCard>
  );
};
