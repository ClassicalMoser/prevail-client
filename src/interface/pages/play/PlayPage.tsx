import { isCommitChoiceType, useCore, useSeatPlaySession } from '@application';
import type {
  CommandCard,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import { BoardComponent } from '@interface/board';
import { useParams } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { createMemo, Show } from 'solid-js';
import { PlayChoicePanel } from './choices/PlayChoicePanel';
import { assignUnitSupportHint } from './hints/assignUnitSupportHint';
import { boardProgressHint } from './hints/boardProgressHint';
import { commitHint } from './hints/commitHint';
import { routDiscardHint } from './hints/routDiscardHint';
import { waitHint } from './hints/waitHint';
import { PlayHandStrip } from './PlayHandStrip';
import { PlayHeader } from './PlayHeader';
import { parseSide } from './playPageHelpers';
import { PlayTableStrip } from './PlayTableStrip';

export function PlayPage(): JSX.Element {
  const params = useParams({ from: '/admin/play/$gameId/$side' });
  const core = useCore();

  const side = createMemo(() => parseSide(params().side));
  const gameId = createMemo(() => params().gameId);

  const session = useSeatPlaySession(
    () => gameId(),
    () => side() ?? 'white',
  );

  const setupUnits = createMemo((): UnitInstance[] => {
    const options = session.legalOptions();
    if (options === null || options.choiceType !== 'setupUnits') {
      return [];
    }
    return [...options.setupUnits.units];
  });

  const awaitingCommander = createMemo(() => {
    const sel = session.selection();
    return sel.kind === 'setup' && sel.awaitingCommander;
  });

  const handSelectable = createMemo(() => {
    const options = session.legalOptions();
    return (
      options !== null &&
      (options.choiceType === 'chooseCard' ||
        options.choiceType === 'chooseRoutDiscard' ||
        options.choiceType === 'assignUnitSupport' ||
        isCommitChoiceType(options.choiceType))
    );
  });

  const commitHintText = createMemo(() => commitHint(session.legalOptions()));
  const routDiscardHintText = createMemo(() =>
    routDiscardHint(session.legalOptions(), session.selection()),
  );
  const assignUnitSupportHintText = createMemo(() =>
    assignUnitSupportHint(session.legalOptions(), session.selection()),
  );
  const boardProgress = createMemo(() =>
    boardProgressHint(session.selection()),
  );
  const waitHintText = createMemo(() =>
    waitHint({
      options: session.legalOptions(),
      side: side(),
      phaseSummary: core.game.phaseSummary(),
      remaining: session.remainingCommands(),
      playCardSlots: session.playCardSlots(),
    }),
  );

  const canSelectRemaining = createMemo(
    () => session.legalOptions()?.choiceType === 'issueCommand',
  );

  const selectedRemainingIndex = createMemo((): number | undefined => {
    const sel = session.selection();
    const human = side();
    if (
      human === undefined ||
      sel.kind !== 'issueCommand' ||
      sel.command === undefined
    ) {
      return undefined;
    }
    const remaining = session.remainingCommands()?.[human] ?? [];
    const idx = remaining.indexOf(sel.command);
    return idx !== -1 ? idx : undefined;
  });

  const onHandCardActivate = (card: CommandCard): void => {
    const options = session.legalOptions();
    if (options === null) {
      return;
    }
    if (options.choiceType === 'chooseRoutDiscard') {
      session.onToggleRoutCard(card.id);
      return;
    }
    if (options.choiceType === 'assignUnitSupport') {
      session.onSelectAssignUnitSupportCard(card.id);
      return;
    }
    if (
      options.choiceType === 'chooseCard' ||
      isCommitChoiceType(options.choiceType)
    ) {
      session.onChooseCardId(card.id);
    }
  };

  return (
    <main class="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden">
      <Show
        when={side()}
        fallback={
          <p class="text-destructive p-4 text-sm">
            Invalid seat side. Use white or black.
          </p>
        }
      >
        {(humanSide) => (
          <>
            <PlayHeader
              gameId={gameId}
              humanSide={humanSide}
              session={session}
              waitHint={waitHintText}
              hasGameState={core.game.hasGameState}
              roundNumber={core.game.roundNumber}
              initiative={core.game.initiative}
              phaseSummary={core.game.phaseSummary}
            />

            <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
              <div class="board-host flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden p-2">
                <BoardComponent
                  board={core.game.board}
                  cells={session.boardCells}
                  onCellClick={session.onCellClick}
                  onFacingClick={session.onFacingClick}
                />
              </div>

              <aside class="border-border flex max-h-[38vh] w-full shrink-0 flex-col gap-3 overflow-hidden border-t px-3 py-3 lg:max-h-none lg:w-72 lg:border-t-0 lg:border-l xl:w-80">
                <div class="shrink-0 overflow-visible">
                  <PlayTableStrip
                    humanSide={humanSide}
                    you={() => session.playCardSlots().you}
                    opponent={() => session.playCardSlots().opponent}
                    remaining={session.remainingCommands}
                    issued={session.issuedCommands}
                    canSelectRemaining={canSelectRemaining}
                    selectedRemainingIndex={selectedRemainingIndex}
                    onSelectRemaining={session.onSelectIssueCommand}
                  />
                </div>
                <div class="min-h-0 flex-1 overflow-y-auto">
                  <PlayChoicePanel
                    session={session}
                    setupUnits={setupUnits}
                    awaitingCommander={awaitingCommander}
                    commitHint={commitHintText}
                    routDiscardHint={routDiscardHintText}
                    assignUnitSupportHint={assignUnitSupportHintText}
                    boardProgress={boardProgress}
                  />
                </div>
              </aside>
            </div>

            <PlayHandStrip
              session={session}
              handSelectable={handSelectable}
              onHandCardActivate={onHandCardActivate}
            />
          </>
        )}
      </Show>
    </main>
  );
}
