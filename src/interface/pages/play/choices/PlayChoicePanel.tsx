import { choiceInstruction } from '@application';
import type { UseSeatPlaySessionResult } from '@application';
import type { UnitInstance } from '@classicalmoser/prevail-rules/domain';
import { Button } from '@interface/components';
import { Show } from 'solid-js';
import type { Accessor, JSX } from 'solid-js';
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
  commitHint: Accessor<string | undefined>;
  routDiscardHint: Accessor<string | undefined>;
  assignUnitSupportHint: Accessor<string | undefined>;
  boardProgress: Accessor<string | undefined>;
}): JSX.Element {
  return (
    <Show when={props.session.legalOptions()}>
      {(options) => (
        <div class="play-choice flex flex-col gap-2 border-t border-border pt-3">
          <div>
            <p class="play-choice__title text-sm font-medium">
              {props.session.choiceTitle()}
            </p>
          </div>

          <Show when={options().choiceType === 'setupUnits'}>
            <SetupChoice
              awaitingCommander={props.awaitingCommander}
              choicePending={props.session.choicePending}
              canUndo={props.session.canUndo}
              hasSetupUnits={() => props.setupUnits().length > 0}
              onUndo={props.session.onUndo}
              onReset={props.session.onResetSelection}
            />
          </Show>

          <Show when={choiceInstruction(options())}>
            {(instruction) => (
              <p class="text-muted-foreground text-xs">{instruction()}</p>
            )}
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
