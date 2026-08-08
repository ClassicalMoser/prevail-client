import type { UnitCount, UnitType } from '@classicalmoser/prevail-rules/domain';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Input,
} from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { PublishedCardThumb } from '../published-card-thumb';

const rosterGrid =
  'grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12';

export const ArmyUnitsSection = (props: {
  units: Accessor<UnitCount[]>;
  catalog: Accessor<UnitType[] | undefined>;
  isCatalogLoading: Accessor<boolean>;
  canAddUnit: (unitType: UnitType) => boolean;
  maxCopiesFor: (unitType: UnitType) => number;
  onSetCount: (unitType: UnitType, count: number) => void;
  onRemove: (unitTypeId: string) => void;
}): JSX.Element => {
  const availableToAdd = (): UnitType[] => {
    const catalog = props.catalog() ?? [];
    const taken = new Set(props.units().map((u) => u.unitType.id));
    return catalog.filter((unit) => !taken.has(unit.id));
  };

  return (
    <Card class="!overflow-visible">
      <CardHeader>
        <CardTitle>Units</CardTitle>
        <CardDescription>
          Distinct unit types are capped by mode. Copies per type cannot exceed
          the unit’s limit. Hover a thumb to enlarge.
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-6 !overflow-visible">
        <section aria-labelledby="army-units-roster-heading">
          <h3 id="army-units-roster-heading" class="font-heading mb-2 text-sm">
            In this army
          </h3>
          <Show
            when={props.units().length > 0}
            fallback={
              <p class="text-muted-foreground text-sm">
                No units yet — pick from the catalog below.
              </p>
            }
          >
            <ul class={rosterGrid}>
              <For each={props.units()}>
                {(entry) => (
                  <li>
                    <PublishedCardThumb
                      kind="unit"
                      id={entry.unitType.id}
                      version={entry.unitType.version}
                      name={entry.unitType.name}
                      meta={`×${entry.count} · ${entry.unitType.cost}c · m${entry.unitType.morale}`}
                    >
                      <div class="flex flex-col gap-1">
                        <FormField
                          label="Count"
                          for={`count-${entry.unitType.id}`}
                        >
                          <Input
                            id={`count-${entry.unitType.id}`}
                            class="h-7 w-14 px-1 text-xs"
                            type="number"
                            min={1}
                            max={props.maxCopiesFor(entry.unitType)}
                            value={entry.count}
                            onInput={(event) => {
                              props.onSetCount(
                                entry.unitType,
                                Number(event.currentTarget.value),
                              );
                            }}
                          />
                        </FormField>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          class="h-7 px-1 text-xs"
                          onClick={() => {
                            props.onRemove(entry.unitType.id);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </PublishedCardThumb>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </section>

        <section aria-labelledby="army-units-catalog-heading">
          <h3 id="army-units-catalog-heading" class="font-heading mb-2 text-sm">
            Available unit cards
          </h3>
          <Show
            when={!props.isCatalogLoading()}
            fallback={
              <p class="text-muted-foreground text-sm">Loading unit cards…</p>
            }
          >
            <Show
              when={availableToAdd().length > 0}
              fallback={
                <p class="text-muted-foreground text-sm">
                  {props.catalog()?.length
                    ? 'Every current unit type is already in this army.'
                    : 'No current unit cards available.'}
                </p>
              }
            >
              <ul class={rosterGrid}>
                <For each={availableToAdd()}>
                  {(unit) => (
                    <li>
                      <PublishedCardThumb
                        kind="unit"
                        id={unit.id}
                        version={unit.version}
                        name={unit.name}
                        meta={`${unit.cost}c · m${unit.morale}`}
                        disabled={!props.canAddUnit(unit)}
                        onActivate={() => {
                          props.onSetCount(unit, 1);
                        }}
                      />
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </Show>
        </section>
      </CardContent>
    </Card>
  );
};
