import { useCore, useSeatPlaySession } from '@application';
import type {
  PlayerSide,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import { BoardComponent, Button, GameStatus } from '@interface';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@interface/components';
import { useParams } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { createMemo, For, Show } from 'solid-js';

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

  return (
    <main class="container mx-auto flex flex-col items-center gap-4 p-4 py-8">
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
            <div class="w-full max-w-3xl text-center">
              <h1 class="font-display text-3xl tracking-wide">Play</h1>
              <p class="text-muted-foreground text-sm">
                Game {gameId()} · seat {humanSide()}
              </p>
            </div>

            <Card class="w-full max-w-md text-left">
              <CardHeader>
                <CardTitle>Connection</CardTitle>
                <CardDescription>
                  Status: {session.connectionStatus()}
                </CardDescription>
              </CardHeader>
              <Show when={session.choiceRejected()}>
                {(rejection) => (
                  <CardContent>
                    <p class="text-destructive text-sm">
                      Choice rejected: {rejection().errorReason}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      class="mt-2"
                      onClick={session.clearRejection}
                    >
                      Dismiss
                    </Button>
                  </CardContent>
                )}
              </Show>
            </Card>

            <GameStatus
              hasGameState={core.game.hasGameState}
              roundNumber={core.game.roundNumber}
              initiative={core.game.initiative}
              phaseSummary={core.game.phaseSummary}
            />

            <Show when={session.legalOptions()}>
              {(options) => (
                <Card class="w-full max-w-md text-left">
                  <CardHeader>
                    <CardTitle>Your choice</CardTitle>
                    <CardDescription>
                      {options().choiceType} (event #
                      {options().expectedEventNumber})
                    </CardDescription>
                  </CardHeader>
                  <CardContent class="flex flex-col gap-2">
                    <Show when={options().choiceType === 'setupUnits'}>
                      <p class="text-muted-foreground text-xs">
                        Select a reserved unit, then click a highlighted setup
                        cell. Facing defaults by side.
                      </p>
                      <div class="flex flex-wrap gap-2">
                        <For each={setupUnits()}>
                          {(unit) => {
                            const selected = () => {
                              const sel = session.selection();
                              return (
                                sel.kind === 'setup' &&
                                isSelectedSetupUnit(sel.selectedUnit, unit)
                              );
                            };
                            return (
                              <Button
                                type="button"
                                size="sm"
                                variant={selected() ? 'default' : 'outline'}
                                onClick={() => session.onSelectSetupUnit(unit)}
                              >
                                {unit.unitType.name} #{unit.instanceNumber}
                              </Button>
                            );
                          }}
                        </For>
                      </div>
                    </Show>

                    <Show when={options().choiceType === 'issueCommand'}>
                      <div class="flex flex-wrap gap-2">
                        <For each={session.issueCommands()}>
                          {(entry) => (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                session.onSelectIssueCommand(entry.index)
                              }
                            >
                              {entry.label}
                            </Button>
                          )}
                        </For>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={session.onConfirmIssueCommand}
                      >
                        Confirm issue command
                      </Button>
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

                    <Show when={session.handCards().length > 0}>
                      <div class="flex flex-wrap gap-2">
                        <For each={session.handCards()}>
                          {(card) => (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                if (
                                  options().choiceType === 'chooseRoutDiscard'
                                ) {
                                  session.onToggleRoutCard(card.id);
                                } else {
                                  session.onChooseCardId(card.id);
                                }
                              }}
                            >
                              {card.name}
                            </Button>
                          )}
                        </For>
                      </div>
                    </Show>
                  </CardContent>
                </Card>
              )}
            </Show>

            <div class="board-host flex flex-col gap-2 justify-center">
              <BoardComponent
                board={core.game.board}
                cells={session.boardCells}
                onCellClick={session.onCellClick}
              />
            </div>
          </>
        )}
      </Show>
    </main>
  );
}
