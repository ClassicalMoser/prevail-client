import type { SeatSelection } from '@application';
import type { Command } from '@classicalmoser/prevail-rules/domain';
import { Button } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { DraftControls } from './DraftControls';

export function IssueCommandChoice(props: {
  issueCommands: Accessor<{ index: number; label: string; command: Command }[]>;
  selection: Accessor<SeatSelection>;
  progress: Accessor<string | null>;
  canConfirm: Accessor<boolean>;
  canDoneIssuing: Accessor<boolean>;
  canUndo: Accessor<boolean>;
  choicePending: Accessor<boolean>;
  onSelectIssueCommand: (index: number) => void;
  onConfirm: () => void;
  onDoneIssuing: () => void;
  onUndo: () => void;
  onReset: () => void;
}): JSX.Element {
  return (
    <>
      <p class="text-muted-foreground text-xs">
        Pick a command, then units on the board (up to the offer). Lines: start,
        then end (same unit = single).
      </p>
      <div class="flex flex-wrap gap-2">
        <For each={props.issueCommands()}>
          {(entry) => {
            const selected = () => {
              const sel = props.selection();
              return (
                sel.kind === 'issueCommand' && sel.command === entry.command
              );
            };
            return (
              <Button
                type="button"
                size="sm"
                variant={selected() ? 'default' : 'outline'}
                onClick={() => props.onSelectIssueCommand(entry.index)}
              >
                {entry.label}
              </Button>
            );
          }}
        </For>
      </div>
      <Show when={props.progress()}>
        {(progress) => (
          <p class="text-muted-foreground text-xs">{progress()}</p>
        )}
      </Show>
      <div class="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!props.canConfirm()}
          onClick={props.onConfirm}
        >
          Confirm
        </Button>
        <Show when={props.canDoneIssuing()}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={props.onDoneIssuing}
          >
            Done issuing
          </Button>
        </Show>
        <DraftControls
          canUndo={props.canUndo}
          choicePending={props.choicePending}
          onUndo={props.onUndo}
          onReset={props.onReset}
        />
      </div>
    </>
  );
}
