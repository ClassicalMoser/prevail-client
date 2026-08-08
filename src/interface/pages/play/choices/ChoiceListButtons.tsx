import type { ChoiceListItem } from '@application';
import { Button } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';

export function ChoiceListButtons(props: {
  items: Accessor<ChoiceListItem[]>;
  onChoiceItem: (item: ChoiceListItem) => void;
}): JSX.Element {
  return (
    <Show when={props.items().length > 0}>
      <div class="flex flex-wrap gap-2">
        <For each={props.items()}>
          {(item) => (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => props.onChoiceItem(item)}
            >
              {item.label}
            </Button>
          )}
        </For>
      </div>
    </Show>
  );
}
