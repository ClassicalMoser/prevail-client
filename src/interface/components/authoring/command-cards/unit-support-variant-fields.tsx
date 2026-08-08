import type {
  Trait,
  UnitSupport,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';
import { traits } from '@classicalmoser/prevail-rules/domain';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { FormField } from '../../form-field';
import { NativeSelect, NativeSelectOption } from '../../native-select';
import { PublishedCardThumb } from '../published-card-thumb';

const catalogGrid =
  'grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12';

export const UnitSupportVariantFields = (props: {
  unitSupport: Accessor<UnitSupport>;
  onChange: (unitSupport: UnitSupport) => void;
  unitCatalog: Accessor<UnitType[] | undefined>;
  isUnitCatalogLoading: Accessor<boolean>;
}): JSX.Element => {
  // Narrow per-variant once so reads stay type-safe across accessor calls.
  const traitSupport = ():
    | Extract<UnitSupport, { supportType: 'trait' }>
    | undefined => {
    const support = props.unitSupport();
    return support.supportType === 'trait' ? support : undefined;
  };

  const unitTypeSupport = ():
    | Extract<UnitSupport, { supportType: 'unitType' }>
    | undefined => {
    const support = props.unitSupport();
    return support.supportType === 'unitType' ? support : undefined;
  };

  const selectedUnit = (): UnitType | undefined => {
    const support = unitTypeSupport();
    if (support === undefined || support.unitTypeId.length === 0) {
      return;
    }
    return (props.unitCatalog() ?? []).find(
      (unit) => unit.id === support.unitTypeId,
    );
  };

  return (
    <>
      <Show when={traitSupport()}>
        {(unitSupport) => (
          <FormField label="Trait" for="unit-support-trait">
            <NativeSelect
              id="unit-support-trait"
              value={unitSupport().trait}
              onChange={(event) => {
                props.onChange({
                  ...unitSupport(),
                  trait: event.currentTarget.value as Trait,
                });
              }}
            >
              <For each={[...traits]}>
                {(trait) => (
                  <NativeSelectOption value={trait}>{trait}</NativeSelectOption>
                )}
              </For>
            </NativeSelect>
          </FormField>
        )}
      </Show>

      <Show when={unitTypeSupport()}>
        {(unitSupport) => (
          <div class="flex flex-col gap-3">
            <p class="text-sm font-medium">Unit type</p>
            <p class="text-muted-foreground text-xs">
              Pick a current unit card. Hover a thumb to enlarge.
            </p>
            <Show
              when={selectedUnit()}
              fallback={
                <Show when={unitSupport().unitTypeId.length > 0}>
                  <p class="text-muted-foreground text-xs">
                    Selected id{' '}
                    <span class="font-mono">{unitSupport().unitTypeId}</span> is
                    not in the current catalog.
                  </p>
                </Show>
              }
            >
              {(unit) => (
                <p class="text-muted-foreground text-xs">
                  Selected: <span class="text-foreground">{unit().name}</span>
                </p>
              )}
            </Show>
            <Show
              when={!props.isUnitCatalogLoading()}
              fallback={
                <p class="text-muted-foreground text-sm">Loading unit cards…</p>
              }
            >
              <Show
                when={(props.unitCatalog()?.length ?? 0) > 0}
                fallback={
                  <p class="text-muted-foreground text-sm">
                    No current unit cards available.
                  </p>
                }
              >
                <ul class={catalogGrid}>
                  <For each={props.unitCatalog() ?? []}>
                    {(unit) => (
                      <li>
                        <PublishedCardThumb
                          kind="unit"
                          id={unit.id}
                          version={unit.version}
                          name={unit.name}
                          meta={`${unit.cost}c · m${unit.morale}`}
                          selected={unit.id === unitSupport().unitTypeId}
                          onActivate={() => {
                            props.onChange({
                              ...unitSupport(),
                              unitTypeId: unit.id,
                            });
                          }}
                        />
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </Show>
          </div>
        )}
      </Show>
    </>
  );
};
