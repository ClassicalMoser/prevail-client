import { useCore, useSeatPlaySession } from '@application';
import type {
  CommandCard,
  PlayerSide,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import { BoardComponent } from '@interface/board';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PublishedCardThumb,
} from '@interface/components';
import { GameStatus } from '@interface/gameStatus';
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
        options.choiceType === 'chooseRoutDiscard')
    );
  });

  const waitHint = createMemo((): string | undefined => {
    if (session.legalOptions() !== null) {
      return undefined;
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
    if (sel.kind !== 'issueCommand' || sel.command === undefined) {
      return null;
    }
    if (sel.command.size === 'units') {
      return `${sel.selected.length} / ${sel.command.number} units`;
    }
    if (sel.lineStart === undefined) {
      return 'Click a unit to start the line';
    }
    if (sel.selected.length === 0) {
      return 'Click a unit to end the line (same unit = single)';
    }
    return `Line: ${sel.selected.length} unit(s)`;
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
    if (options.choiceType === 'chooseCard') {
      session.onChooseCardId(card.id);
    }
  };

  return (
    <main class="relative flex min-h-dvh flex-col items-center gap-3 px-4 pt-4 pb-32">
      <Show
        when={side()}
        fallback={
          <p class="text-destructive text-sm">
            Invalid seat side. Use white or black.
          </p>
        }
      >
        {(humanSide) => (
          <>
            <div class="w-full max-w-3xl shrink-0 text-center">
              <h1 class="font-display text-2xl tracking-wide">Play</h1>
              <p class="text-muted-foreground text-xs">
                Game {gameId()} · seat {humanSide()} ·{' '}
                {session.connectionStatus()}
              </p>
            </div>

            <Show when={session.choiceRejected()}>
              {(rejection) => (
                <Card class="w-full max-w-3xl shrink-0 text-left">
                  <CardContent class="flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="min-w-0">
                      <p class="text-destructive text-sm">
                        Choice rejected: {rejection().errorReason}
                      </p>
                      <p class="text-muted-foreground text-xs">
                        Draft kept. Retry sends the same choice again, or undo /
                        edit first.
                      </p>
                    </div>
                    <div class="flex shrink-0 flex-wrap gap-2">
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
                        Reset draft
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
                  </CardContent>
                </Card>
              )}
            </Show>

            <Show when={session.choicePending()}>
              <p class="text-muted-foreground w-full max-w-3xl text-center text-sm">
                Waiting for server to accept your choice…
              </p>
            </Show>

            <GameStatus
              hasGameState={core.game.hasGameState}
              roundNumber={core.game.roundNumber}
              initiative={core.game.initiative}
              phaseSummary={core.game.phaseSummary}
            />

            <PlayTableStrip
              humanSide={humanSide}
              you={() => session.playCardSlots().you}
              opponent={() => session.playCardSlots().opponent}
              remaining={session.remainingCommands}
              issued={session.issuedCommands}
            />

            <Show when={waitHint()}>
              {(hint) => (
                <p class="text-muted-foreground w-full max-w-3xl text-center text-sm">
                  {hint()}
                </p>
              )}
            </Show>

            <Show when={session.legalOptions()}>
              {(options) => (
                <Card class="w-full max-w-3xl shrink-0 text-left">
                  <CardHeader class="py-3">
                    <CardTitle class="text-base">Your choice</CardTitle>
                    <CardDescription>
                      {options().choiceType} (event #
                      {options().expectedEventNumber})
                    </CardDescription>
                  </CardHeader>
                  <CardContent class="flex flex-col gap-2 pt-0">
                    <Show when={options().choiceType === 'setupUnits'}>
                      <p class="text-muted-foreground text-xs">
                        Place each unit with a facing arrow, then click a
                        setup-zone cell for your commander. Tap a placed unit
                        (card or board) to pick it up and move it before commit.
                      </p>
                      <Show when={awaitingCommander()}>
                        <p class="text-xs font-medium text-amber-700 dark:text-amber-300">
                          Choose a setup-zone cell for your commander — or tap a
                          unit to reposition it first.
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
                        <div class="flex flex-wrap justify-center gap-2 overflow-visible">
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
                                    (p) => unitKey(p.unit) === unitKey(unit),
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
                          Undo last placement
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={session.choicePending()}
                          onClick={session.onResetSelection}
                        >
                          Reset setup draft
                        </Button>
                      </div>
                    </Show>

                    <Show when={options().choiceType === 'chooseCard'}>
                      <p class="text-sm font-medium">
                        Select a command card from your hand below.
                      </p>
                      <p class="text-muted-foreground text-xs">
                        Legal cards are highlighted. Tap one to play it face
                        down.
                      </p>
                    </Show>

                    <Show when={options().choiceType === 'chooseRoutDiscard'}>
                      <p class="text-sm font-medium">
                        Discard cards from your hand (tap to toggle).
                      </p>
                    </Show>

                    <Show when={options().choiceType === 'issueCommand'}>
                      <p class="text-sm font-medium">
                        Issue a command from your card.
                      </p>
                      <p class="text-muted-foreground text-xs">
                        Pick a command, then select unit(s) on the board. Lines:
                        start unit, then end unit. After a rejection, Reset
                        clears picks so you can choose again; Retry resends the
                        last attempt.
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
                          Confirm issue command
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
                  </CardContent>
                </Card>
              )}
            </Show>

            <div class="board-host flex min-h-0 flex-1 flex-col items-center justify-center">
              <BoardComponent
                board={core.game.board}
                cells={session.boardCells}
                onCellClick={session.onCellClick}
                onFacingClick={session.onFacingClick}
              />
            </div>

            <Show when={session.handCards().length > 0}>
              <section
                class="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 border-t px-2 py-2 backdrop-blur-sm"
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
