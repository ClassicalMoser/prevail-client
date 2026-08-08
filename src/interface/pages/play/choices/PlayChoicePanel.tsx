import type { UseSeatPlaySessionResult } from '@application';
import type { UnitInstance } from '@classicalmoser/prevail-rules/domain';
import { Button } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';
import { ChoiceListButtons } from './ChoiceListButtons';
import { CommitChoice } from './CommitChoice';
import { IssueCommandChoice } from './IssueCommandChoice';
import { MoveUnitChoice } from './MoveUnitChoice';
import { RangedChoice } from './RangedChoice';
import { RoutChoice } from './RoutChoice';
import { SetupChoice } from './SetupChoice';
import { SupportChoice } from './SupportChoice';

/** Phase-specific choice UI for the seat play rail. */
export function PlayChoicePanel(props: {
  session: UseSeatPlaySessionResult;
  setupUnits: Accessor<UnitInstance[]>;
  awaitingCommander: Accessor<boolean>;
  commitHint: Accessor<string | null>;
  routDiscardHint: Accessor<string | null>;
  assignUnitSupportHint: Accessor<string | null>;
  boardProgress: Accessor<string | null>;
}): JSX.Element {
  return (
    <Show when={props.session.legalOptions()}>
      {(options) => (
        <div class="flex flex-col gap-2 border-t border-border pt-3">
          <div>
            <p class="text-sm font-medium">Your choice</p>
            <p class="text-muted-foreground text-xs">
              {options().choiceType} · event #{options().expectedEventNumber}
            </p>
          </div>

          <Show when={options().choiceType === 'setupUnits'}>
            <SetupChoice
              setupUnits={props.setupUnits}
              selection={props.session.selection}
              awaitingCommander={props.awaitingCommander}
              choicePending={props.session.choicePending}
              canUndo={props.session.canUndo}
              onSelectSetupUnit={props.session.onSelectSetupUnit}
              onUndo={props.session.onUndo}
              onReset={props.session.onResetSelection}
            />
          </Show>

          <Show when={options().choiceType === 'chooseCard'}>
            <p class="text-muted-foreground text-xs">
              Select a highlighted command card from your hand.
            </p>
          </Show>

          <CommitChoice
            hint={props.commitHint}
            canRefuseCommit={props.session.canRefuseCommit}
            choicePending={props.session.choicePending}
            onRefuseCommit={props.session.onRefuseCommit}
          />

          <RoutChoice hint={props.routDiscardHint} />

          <SupportChoice
            hint={props.assignUnitSupportHint}
            canConfirm={props.session.canConfirmAssignUnitSupport}
            canUndo={props.session.canUndo}
            choicePending={props.session.choicePending}
            onConfirm={props.session.onConfirmAssignUnitSupport}
            onUndo={props.session.onUndo}
            onReset={props.session.onResetSelection}
          />

          <Show when={options().choiceType === 'issueCommand'}>
            <IssueCommandChoice
              issueCommands={props.session.issueCommands}
              selection={props.session.selection}
              progress={props.boardProgress}
              canConfirm={props.session.canConfirmIssue}
              canDoneIssuing={props.session.canDoneIssuing}
              canUndo={props.session.canUndo}
              choicePending={props.session.choicePending}
              onSelectIssueCommand={props.session.onSelectIssueCommand}
              onConfirm={props.session.onConfirmIssueCommand}
              onDoneIssuing={props.session.onDoneIssuingCommands}
              onUndo={props.session.onUndo}
              onReset={props.session.onResetSelection}
            />
          </Show>

          <Show when={options().choiceType === 'doneIssuingCommands'}>
            <p class="text-muted-foreground text-xs">
              No remaining command can be issued (for example ranged slots with
              no eligible units). End the issue step to continue.
            </p>
            <Button
              type="button"
              size="sm"
              disabled={!props.session.canDoneIssuing()}
              onClick={props.session.onDoneIssuingCommands}
            >
              Done issuing
            </Button>
          </Show>

          <Show when={options().choiceType === 'moveUnit'}>
            <MoveUnitChoice
              progress={props.boardProgress}
              canUndo={props.session.canUndo}
              choicePending={props.session.choicePending}
              onUndo={props.session.onUndo}
              onReset={props.session.onResetSelection}
            />
          </Show>

          <Show when={options().choiceType === 'performRangedAttack'}>
            <RangedChoice
              progress={props.boardProgress}
              canConfirm={props.session.canConfirmPerformRanged}
              canUndo={props.session.canUndo}
              choicePending={props.session.choicePending}
              onConfirm={props.session.onConfirmPerformRangedAttack}
              onUndo={props.session.onUndo}
              onReset={props.session.onResetSelection}
            />
          </Show>

          <ChoiceListButtons
            items={props.session.choiceItems}
            onChoiceItem={props.session.onChoiceItem}
          />
        </div>
      )}
    </Show>
  );
}
