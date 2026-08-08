import type { SeatSelection } from '@application';
import { unitKey } from '@application';
import type { UnitInstance } from '@classicalmoser/prevail-rules/domain';
import { PublishedCardThumb } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { isSelectedSetupUnit } from '../playPageHelpers';
import { DraftControls } from './DraftControls';

export function SetupChoice(props: {
  setupUnits: Accessor<UnitInstance[]>;
  selection: Accessor<SeatSelection>;
  awaitingCommander: Accessor<boolean>;
  choicePending: Accessor<boolean>;
  canUndo: Accessor<boolean>;
  onSelectSetupUnit: (unit: UnitInstance) => void;
  onUndo: () => void;
  onReset: () => void;
}): JSX.Element {
  return (
    <>
      <p class="text-muted-foreground text-xs">
        Place each unit with a facing arrow, then click a setup-zone cell for
        your commander.
      </p>
      <Show when={props.awaitingCommander()}>
        <p class="text-xs font-medium text-amber-700 dark:text-amber-300">
          Choose a setup-zone cell for your commander.
        </p>
      </Show>
      <Show
        when={props.setupUnits().length > 0}
        fallback={
          <p class="text-destructive text-xs">
            No reserved units for this seat.
          </p>
        }
      >
        <div class="flex flex-wrap gap-2 overflow-visible">
          <For each={props.setupUnits()}>
            {(unit) => {
              const selected = () => {
                const sel = props.selection();
                return (
                  sel.kind === 'setup' &&
                  isSelectedSetupUnit(sel.selectedUnit, unit)
                );
              };
              const placed = () => {
                const sel = props.selection();
                return (
                  sel.kind === 'setup' &&
                  sel.placements.some((p) => unitKey(p.unit) === unitKey(unit))
                );
              };
              return (
                <PublishedCardThumb
                  kind="unit"
                  id={unit.unitType.id}
                  version={unit.unitType.version}
                  name={unit.unitType.name}
                  meta={
                    placed()
                      ? `#${unit.instanceNumber} · move`
                      : `#${unit.instanceNumber}`
                  }
                  size="xs"
                  selected={selected()}
                  disabled={props.choicePending()}
                  onActivate={() => props.onSelectSetupUnit(unit)}
                />
              );
            }}
          </For>
        </div>
      </Show>
      <DraftControls
        canUndo={props.canUndo}
        choicePending={props.choicePending}
        onUndo={props.onUndo}
        onReset={props.onReset}
      />
    </>
  );
}
