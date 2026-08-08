import { useCore, useSeatPlaySession } from '@application';
import type { PhaseSummary } from '@application';
import type {
  CommandCard,
  PlayerSide,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import { BoardComponent } from '@interface/board';
import { Button, PublishedCardThumb } from '@interface/components';
import { useParams } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { createMemo, For, Show } from 'solid-js';
import { PlayTableStrip } from './PlayTableStrip';

function parseSide(raw: string): PlayerSide | undefined {
  if (raw === 'white' || raw === 'black') {
    return raw;
  }
  return undefined;
}

function isSelectedSetupUnit(
  selected: UnitInstance | undefined,
  unit: UnitInstance,
): boolean {
  return (
    selected !== undefined &&
    selected.instanceNumber === unit.instanceNumber &&
    selected.unitType.id === unit.unitType.id
  );
}

function unitKey(unit: UnitInstance): string {
  return `${unit.playerSide}:${unit.unitType.id}:${unit.instanceNumber}`;
}

function formatPhase(summary: PhaseSummary | undefined): string {
  if (summary === undefined) {
    return '—';
  }
  if (summary.kind === 'none') {
    return 'pre-phase';
  }
  return `${summary.phase} / ${summary.step}`;
}

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
        options.choiceType === 'assignUnitSupport')
    );
  });

  const routDiscardHint = createMemo((): string | null => {
    const options = session.legalOptions();
    if (options?.choiceType !== 'chooseRoutDiscard') {
      return null;
    }
    const need = options.routDiscard.numberToDiscard;
    const have = options.routDiscard.cardIds.length;
    const cards = need === 1 ? 'card' : 'cards';
    if (have < need) {
      return `Rout penalty: discard ${need} ${cards} — you only have ${have} in hand.`;
    }
    const sel = session.selection();
    const picked =
      sel.kind === 'routDiscard' ? sel.selectedCardIds.length : 0;
    return `Rout penalty: discard ${need} ${cards} from your hand (tap to toggle) · ${picked}/${need}`;
  });

  const assignUnitSupportHint = createMemo((): string | null => {
    const options = session.legalOptions();
    if (options?.choiceType !== 'assignUnitSupport') {
      return null;
    }
    const sel = session.selection();
    const covered =
      sel.kind === 'assignUnitSupport'
        ? sel.assignments.reduce((n, a) => n + a.units.length, 0)
        : 0;
    const slots = options.unitSupportGrants.grants.reduce(
      (n, g) => n + g.unitSupport.count,
      0,
    );
    return `Assign hand support to units (uncovered units rout). Tap a support card, then units · ${covered}/${slots} slots used — Confirm when done.`;
  });

  const waitHint = createMemo((): string | undefined => {
    const options = session.legalOptions();
    if (options !== null) {
      return undefined;
    }
    const seat = side();
    if (seat === undefined) {
      return undefined;
    }
    const summary = core.game.phaseSummary();
    if (
      summary !== undefined &&
      summary.kind === 'phase' &&
      summary.phase === 'issueCommands'
    ) {
      const rem = session.remainingCommands();
      const yours = rem?.[seat] ?? [];
      if (summary.step.includes('Resolve') && yours.length > 0) {
        return `Waiting for opponent to finish resolving — then you issue: ${yours.map((c) => `${c.type} ×${c.number} (${c.size})`).join(', ')}`;
      }
      if (summary.step.includes('Issue') || summary.step.includes('Resolve')) {
        return 'Waiting for opponent…';
      }
    }
    const slots = session.playCardSlots();
    if (slots.you.kind !== 'empty' && slots.opponent.kind === 'empty') {
      return 'Waiting for opponent to select a command card…';
    }
    if (slots.you.kind === 'empty' && slots.opponent.kind === 'facedown') {
      return 'Opponent has selected a card. Choose yours from your hand.';
    }
    if (
      slots.you.kind === 'facedown' ||
      (slots.you.kind === 'card' && slots.you.label === 'Selected')
    ) {
      return 'Card selected. Waiting for the round to continue…';
    }
    return undefined;
  });

  const issueProgress = createMemo((): string | null => {
    const sel = session.selection();
    if (sel.kind === 'issueCommand' && sel.command !== undefined) {
      if (sel.command.size === 'units') {
        return `${sel.selected.length} / ${sel.command.number} units`;
      }
      if (sel.lineStart === undefined) {
        return 'Click a unit to start the line';
      }
      if (sel.selected.length === 0) {
        return 'Click an end (same unit = single)';
      }
      return `Line: ${sel.selected.length} unit(s)`;
    }
    if (sel.kind === 'moveUnit') {
      if (sel.unit === undefined) {
        return 'Click a commanded unit to move';
      }
      if (sel.destinations.length === 0) {
        return 'No legal destinations for that unit — pick another';
      }
      return 'Click a highlighted destination';
    }
    if (sel.kind === 'performRangedAttack') {
      if (sel.attacker === undefined) {
        return 'Click a commanded unit to attack with';
      }
      if (sel.target === undefined) {
        return 'Click an enemy in range / front arc';
      }
      return sel.supporters.length > 0
        ? `Target locked · ${sel.supporters.length} supporter(s) — Confirm`
        : 'Target locked · optional supporters, then Confirm';
    }
    return null;
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
    if (options.choiceType === 'chooseCard') {
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
            <header class="border-border flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b px-3 py-2 text-sm">
              <span class="font-display tracking-wide">Play</span>
              <span class="text-muted-foreground text-xs">
                {gameId()} · {humanSide()} · {session.connectionStatus()}
              </span>
              <Show when={core.game.hasGameState()}>
                <span class="text-muted-foreground hidden text-xs sm:inline">
                  R{core.game.roundNumber() ?? '—'} ·{' '}
                  {core.game.initiative() ?? '—'} ·{' '}
                  {formatPhase(core.game.phaseSummary())}
                </span>
              </Show>
              <Show when={session.choicePending()}>
                <span class="text-muted-foreground text-xs">
                  Waiting for server…
                </span>
              </Show>
              <Show when={waitHint()}>
                {(hint) => (
                  <span class="text-muted-foreground text-xs">{hint()}</span>
                )}
              </Show>
              <Show when={session.choiceRejected()}>
                {(rejection) => (
                  <div class="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
                    <p class="text-destructive text-xs">
                      Rejected: {rejection().errorReason}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!session.canRetry()}
                      onClick={session.onRetryLastChoice}
                    >
                      Retry
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!session.canUndo()}
                      onClick={session.onUndo}
                    >
                      Undo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={session.onResetSelection}
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={session.clearRejection}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </Show>
            </header>

            <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
              <div class="board-host flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden p-2">
                <BoardComponent
                  board={core.game.board}
                  cells={session.boardCells}
                  onCellClick={session.onCellClick}
                  onFacingClick={session.onFacingClick}
                />
              </div>

              <aside class="border-border flex max-h-[38vh] w-full shrink-0 flex-col gap-3 overflow-y-auto border-t px-3 py-3 lg:max-h-none lg:w-72 lg:border-t-0 lg:border-l xl:w-80">
                <PlayTableStrip
                  humanSide={humanSide}
                  you={() => session.playCardSlots().you}
                  opponent={() => session.playCardSlots().opponent}
                  remaining={session.remainingCommands}
                  issued={session.issuedCommands}
                />

                <Show when={session.legalOptions()}>
                  {(options) => (
                    <div class="flex flex-col gap-2 border-t border-border pt-3">
                      <div>
                        <p class="text-sm font-medium">Your choice</p>
                        <p class="text-muted-foreground text-xs">
                          {options().choiceType} · event #
                          {options().expectedEventNumber}
                        </p>
                      </div>

                      <Show when={options().choiceType === 'setupUnits'}>
                        <p class="text-muted-foreground text-xs">
                          Place each unit with a facing arrow, then click a
                          setup-zone cell for your commander.
                        </p>
                        <Show when={awaitingCommander()}>
                          <p class="text-xs font-medium text-amber-700 dark:text-amber-300">
                            Choose a setup-zone cell for your commander.
                          </p>
                        </Show>
                        <Show
                          when={setupUnits().length > 0}
                          fallback={
                            <p class="text-destructive text-xs">
                              No reserved units for this seat.
                            </p>
                          }
                        >
                          <div class="flex flex-wrap gap-2 overflow-visible">
                            <For each={setupUnits()}>
                              {(unit) => {
                                const selected = () => {
                                  const sel = session.selection();
                                  return (
                                    sel.kind === 'setup' &&
                                    isSelectedSetupUnit(sel.selectedUnit, unit)
                                  );
                                };
                                const placed = () => {
                                  const sel = session.selection();
                                  return (
                                    sel.kind === 'setup' &&
                                    sel.placements.some(
                                      (p) =>
                                        unitKey(p.unit) === unitKey(unit),
                                    )
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
                                    disabled={session.choicePending()}
                                    onActivate={() =>
                                      session.onSelectSetupUnit(unit)
                                    }
                                  />
                                );
                              }}
                            </For>
                          </div>
                        </Show>
                        <div class="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!session.canUndo()}
                            onClick={session.onUndo}
                          >
                            Undo
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={session.choicePending()}
                            onClick={session.onResetSelection}
                          >
                            Reset
                          </Button>
                        </div>
                      </Show>

                      <Show when={options().choiceType === 'chooseCard'}>
                        <p class="text-muted-foreground text-xs">
                          Select a highlighted command card from your hand.
                        </p>
                      </Show>

                      <Show when={routDiscardHint()}>
                        {(hint) => (
                          <p class="text-muted-foreground text-xs">{hint()}</p>
                        )}
                      </Show>

                      <Show when={assignUnitSupportHint()}>
                        {(hint) => (
                          <>
                            <p class="text-muted-foreground text-xs">{hint()}</p>
                            <div class="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                disabled={!session.canConfirmAssignUnitSupport()}
                                onClick={session.onConfirmAssignUnitSupport}
                              >
                                Confirm support
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={!session.canUndo()}
                                onClick={session.onUndo}
                              >
                                Undo
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={session.choicePending()}
                                onClick={session.onResetSelection}
                              >
                                Reset
                              </Button>
                            </div>
                          </>
                        )}
                      </Show>

                      <Show when={options().choiceType === 'issueCommand'}>
                        <p class="text-muted-foreground text-xs">
                          Pick a command, then units on the board. Lines: start,
                          then end (same unit = single).
                        </p>
                        <div class="flex flex-wrap gap-2">
                          <For each={session.issueCommands()}>
                            {(entry) => {
                              const selected = () => {
                                const sel = session.selection();
                                return (
                                  sel.kind === 'issueCommand' &&
                                  sel.command === entry.command
                                );
                              };
                              return (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={selected() ? 'default' : 'outline'}
                                  onClick={() =>
                                    session.onSelectIssueCommand(entry.index)
                                  }
                                >
                                  {entry.label}
                                </Button>
                              );
                            }}
                          </For>
                        </div>
                        <Show when={issueProgress()}>
                          {(progress) => (
                            <p class="text-muted-foreground text-xs">
                              {progress()}
                            </p>
                          )}
                        </Show>
                        <div class="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={!session.canConfirmIssue()}
                            onClick={session.onConfirmIssueCommand}
                          >
                            Confirm
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!session.canUndo()}
                            onClick={session.onUndo}
                          >
                            Undo
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={session.choicePending()}
                            onClick={session.onResetSelection}
                          >
                            Reset
                          </Button>
                        </div>
                      </Show>

                      <Show when={options().choiceType === 'moveUnit'}>
                        <p class="text-muted-foreground text-xs">
                          Move a commanded unit: click the unit, then a
                          highlighted destination.
                        </p>
                        <Show when={issueProgress()}>
                          {(progress) => (
                            <p class="text-muted-foreground text-xs">
                              {progress()}
                            </p>
                          )}
                        </Show>
                        <div class="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!session.canUndo()}
                            onClick={session.onUndo}
                          >
                            Undo
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={session.choicePending()}
                            onClick={session.onResetSelection}
                          >
                            Reset
                          </Button>
                        </div>
                      </Show>

                      <Show when={options().choiceType === 'performRangedAttack'}>
                        <p class="text-muted-foreground text-xs">
                          Resolve ranged fire: attacker → enemy target → optional
                          supporters, then Confirm.
                        </p>
                        <Show when={issueProgress()}>
                          {(progress) => (
                            <p class="text-muted-foreground text-xs">
                              {progress()}
                            </p>
                          )}
                        </Show>
                        <div class="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={!session.canConfirmPerformRanged()}
                            onClick={session.onConfirmPerformRangedAttack}
                          >
                            Confirm attack
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!session.canUndo()}
                            onClick={session.onUndo}
                          >
                            Undo
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={session.choicePending()}
                            onClick={session.onResetSelection}
                          >
                            Reset
                          </Button>
                        </div>
                      </Show>

                      <Show when={session.choiceItems().length > 0}>
                        <div class="flex flex-wrap gap-2">
                          <For each={session.choiceItems()}>
                            {(item) => (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => session.onChoiceItem(item)}
                              >
                                {item.label}
                              </Button>
                            )}
                          </For>
                        </div>
                      </Show>
                    </div>
                  )}
                </Show>
              </aside>
            </div>

            <Show when={session.handCards().length > 0}>
              <section
                class="border-border bg-background shrink-0 border-t px-2 py-2"
                aria-label="Your hand"
              >
                <Show when={handSelectable()}>
                  <p class="text-muted-foreground mb-1 text-center text-xs">
                    Your hand — tap a highlighted card to play
                  </p>
                </Show>
                <div class="mx-auto flex max-w-5xl flex-wrap items-end justify-center gap-1.5 overflow-visible sm:gap-2">
                  <For each={session.handCards()}>
                    {(card) => {
                      const highlight = () => session.cardHighlights()[card.id];
                      const selected = () => highlight() === 'selected';
                      const legal = () => highlight() === 'legal';
                      return (
                        <Show
                          when={handSelectable()}
                          fallback={
                            <PublishedCardThumb
                              kind="command"
                              id={card.id}
                              version={card.version}
                              name={card.name}
                              size="xs"
                            />
                          }
                        >
                          <PublishedCardThumb
                            kind="command"
                            id={card.id}
                            version={card.version}
                            name={card.name}
                            size="xs"
                            selected={selected() || legal()}
                            disabled={
                              highlight() === undefined ||
                              session.choicePending()
                            }
                            onActivate={() => onHandCardActivate(card)}
                          />
                        </Show>
                      );
                    }}
                  </For>
                </div>
              </section>
            </Show>
          </>
        )}
      </Show>
    </main>
  );
}
