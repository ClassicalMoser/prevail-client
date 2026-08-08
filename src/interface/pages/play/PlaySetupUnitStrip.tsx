import type { SeatSelection } from '@application';
import { setupUnitsByType } from '@application';
import type { UnitInstance } from '@classicalmoser/prevail-rules/domain';
import { PublishedCardThumb } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { createMemo, For, Show } from 'solid-js';

/**
 * Setup units — one face per type; dock enlarge follows peek hit targets.
 */
export function PlaySetupUnitStrip(props: {
  setupUnits: Accessor<UnitInstance[]>;
  selection: Accessor<SeatSelection>;
  choicePending: Accessor<boolean>;
  onSelectSetupUnit: (unit: UnitInstance) => void;
}): JSX.Element {
  const placedUnits = createMemo(() => {
    const sel = props.selection();
    if (sel.kind !== 'setup') {
      return [];
    }
    return sel.placements.map((p) => p.unit);
  });

  const groups = createMemo(() =>
    setupUnitsByType(props.setupUnits(), placedUnits()),
  );

  return (
    <Show when={groups().length > 0}>
      <section class="play-hand" aria-label="Units to place">
        <div class="play-hand__row">
          <For each={groups()}>
            {(group) => {
              const selected = () => {
                const sel = props.selection();
                return (
                  sel.kind === 'setup' &&
                  sel.selectedUnit?.unitType.id === group.typeId
                );
              };
              return (
                <div
                  class="play-hand__card"
                  classList={{
                    'play-hand__card--dim': group.remaining === 0,
                    'play-hand__card--lit': selected(),
                  }}
                >
                  <div class="play-hand__lift" aria-hidden="true">
                    <PublishedCardThumb
                      kind="unit"
                      id={group.typeId}
                      version={group.version}
                      name={group.name}
                      size="xs"
                      hideCaption
                      frame="bare"
                      disableHoverPreview
                    />
                    <Show when={group.total > 1}>
                      <span
                        class="play-hand__count"
                        aria-label={`${group.remaining} of ${group.total} remaining`}
                      >
                        {group.remaining}
                      </span>
                    </Show>
                  </div>
                  <button
                    type="button"
                    class="play-hand__hit"
                    aria-label={
                      group.total > 1
                        ? `${group.name}, ${group.remaining} remaining`
                        : group.name
                    }
                    aria-pressed={selected()}
                    disabled={props.choicePending()}
                    onClick={() => props.onSelectSetupUnit(group.pick)}
                  />
                </div>
              );
            }}
          </For>
        </div>
      </section>
    </Show>
  );
}
