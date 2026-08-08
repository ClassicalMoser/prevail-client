import type { ArmyBudgetProjection } from '@application';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';

const reqVariant = (ok: boolean): 'outline' | 'secondary' | 'destructive' =>
  ok ? 'outline' : 'destructive';

export const ArmyCompositionHeader = (props: {
  gameMode: Accessor<string | undefined>;
  budget: Accessor<ArmyBudgetProjection | undefined>;
  isModeValid: Accessor<boolean>;
}): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle>Composition</CardTitle>
      <CardDescription>
        Checking against mode{' '}
        <span class="font-medium text-foreground">
          {props.gameMode() ?? '—'}
        </span>
        . Mode legality is authoring feedback only — it is not saved with the
        army.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Show when={props.budget()}>
        {(budget) => (
          <div
            class="flex flex-wrap gap-2"
            aria-live="polite"
            aria-label="Army composition requirements"
          >
            <Show when={budget().rules.maxUnitCost !== null}>
              <Badge variant={reqVariant(budget().satisfied.cost)}>
                Cost {budget().totalCost} / {budget().rules.maxUnitCost}
              </Badge>
            </Show>
            <Show when={budget().rules.minMoraleValue !== null}>
              <Badge variant={reqVariant(budget().satisfied.morale)}>
                Morale {budget().totalMorale} / {budget().rules.minMoraleValue}+
              </Badge>
            </Show>
            <Badge variant={reqVariant(budget().satisfied.unitTypes)}>
              Unit types {budget().unitTypeSlotsUsed}/
              {budget().unitTypeSlotsMax}
            </Badge>
            <Show when={budget().commandCardMax !== null}>
              <Badge variant={reqVariant(budget().satisfied.commandTotal)}>
                Command cards {budget().commandCardCount}/
                {budget().commandCardMax}
              </Badge>
            </Show>
            <Show when={budget().rules.cardsPerInitiative !== null}>
              <For each={Object.entries(budget().cardsByInitiative)}>
                {([initiative, count]) => (
                  <Badge
                    variant={
                      budget().satisfied.byInitiative[Number(initiative)]
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    Init {initiative}: {count}/
                    {budget().rules.cardsPerInitiative}
                  </Badge>
                )}
              </For>
            </Show>
            <Badge variant={props.isModeValid() ? 'default' : 'destructive'}>
              {props.isModeValid() ? 'Legal for mode' : 'Not legal yet'}
            </Badge>
          </div>
        )}
      </Show>
    </CardContent>
  </Card>
);
