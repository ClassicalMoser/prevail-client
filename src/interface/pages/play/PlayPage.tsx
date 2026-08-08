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
import { CombatContextPanel } from './CombatContextPanel';
import { assignUnitSupportHint } from './hints/assignUnitSupportHint';
import { boardProgressHint } from './hints/boardProgressHint';
import { commitHint } from './hints/commitHint';
import { routDiscardHint } from './hints/routDiscardHint';
import { waitHint } from './hints/waitHint';
import { PlayGameOverBanner } from './PlayGameOverBanner';
import { PlayHandStrip } from './PlayHandStrip';
import { PlayHeader } from './PlayHeader';
import { PlayInPlayRow } from './PlayInPlayRow';
import { PlayOpponentHand } from './PlayOpponentHand';
import { formatPressureChip, parseSide } from './playPageHelpers';
import { PlaySeatPiles } from './PlaySeatPiles';
import { PlaySetupUnitStrip } from './PlaySetupUnitStrip';
import { PlayTableStrip } from './PlayTableStrip';
import './play.css';

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

  const commitHintText = createMemo(() =>
    commitHint(session.legalOptions(), session.combatContext()),
  );
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
      outcome: core.game.outcome(),
    }),
  );

  const gameFinished = createMemo(
    () => core.game.outcome().status !== 'ongoing',
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

  const pressure = createMemo(() =>
    formatPressureChip({
      routedCount: core.game.routedUnits()?.length ?? 0,
      lostCommanders: core.game.lostCommanders() ?? [],
    }),
  );

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
    <main class="play-page flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden">
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
              outcome={core.game.outcome}
              pressure={pressure}
            />

            <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
              <div class="play-tabletop relative flex min-h-0 min-w-0 flex-1 flex-col">
                <Show when={!gameFinished()}>
                  <div class="play-card-row play-card-row--opp shrink-0">
                    <PlaySeatPiles
                      economy={() => session.cardEconomy().opponent}
                      align="start"
                    />
                    <PlayOpponentHand
                      count={() => session.cardEconomy().opponent.hand}
                    />
                    <div class="play-card-row__spacer" aria-hidden="true" />
                  </div>
                </Show>
                <div class="play-field flex min-h-0 min-w-0 flex-1">
                  <Show when={!gameFinished()}>
                    <PlayInPlayRow
                      you={() => session.playCardSlots().you}
                      opponent={() => session.playCardSlots().opponent}
                    />
                  </Show>
                  <div class="board-host flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden">
                    <BoardComponent
                      board={core.game.board}
                      cells={session.boardCells}
                      onCellClick={
                        gameFinished() ? undefined : session.onCellClick
                      }
                      onFacingClick={
                        gameFinished() ? undefined : session.onFacingClick
                      }
                    />
                  </div>
                </div>
                <Show when={!gameFinished()}>
                  <div class="play-card-row play-card-row--you shrink-0">
                    <PlaySeatPiles
                      economy={() => session.cardEconomy().you}
                      align="start"
                    />
                    <Show
                      when={setupUnits().length > 0}
                      fallback={
                        <PlayHandStrip
                          session={session}
                          handSelectable={handSelectable}
                          onHandCardActivate={onHandCardActivate}
                        />
                      }
                    >
                      <PlaySetupUnitStrip
                        setupUnits={setupUnits}
                        selection={session.selection}
                        choicePending={session.choicePending}
                        onSelectSetupUnit={session.onSelectSetupUnit}
                      />
                    </Show>
                    <div class="play-card-row__spacer" aria-hidden="true" />
                  </div>
                </Show>
              </div>

              <aside class="play-rail border-border flex max-h-[38vh] w-full shrink-0 flex-col gap-3 overflow-hidden border-t px-3 py-3 lg:max-h-none lg:w-72 lg:border-t-0 lg:border-l xl:w-80">
                <div class="shrink-0 overflow-visible">
                  <PlayTableStrip
                    humanSide={humanSide}
                    remaining={session.remainingCommands}
                    issued={session.issuedCommands}
                    canSelectRemaining={canSelectRemaining}
                    selectedRemainingIndex={selectedRemainingIndex}
                    onSelectRemaining={session.onSelectIssueCommand}
                  />
                </div>
                <CombatContextPanel
                  context={session.combatContext}
                  humanSide={humanSide}
                />
                <div class="min-h-0 flex-1 overflow-y-auto">
                  <Show
                    when={gameFinished()}
                    fallback={
                      <PlayChoicePanel
                        session={session}
                        setupUnits={setupUnits}
                        awaitingCommander={awaitingCommander}
                        commitHint={commitHintText}
                        routDiscardHint={routDiscardHintText}
                        assignUnitSupportHint={assignUnitSupportHintText}
                        boardProgress={boardProgress}
                      />
                    }
                  >
                    <PlayGameOverBanner
                      outcome={core.game.outcome}
                      humanSide={humanSide}
                    />
                  </Show>
                </div>
              </aside>
            </div>
          </>
        )}
      </Show>
    </main>
  );
}
