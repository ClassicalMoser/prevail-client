import { useArchiveOwnedArmyMutation, useOwnedArmiesQuery } from '@application';
import { gameModeNames } from '@classicalmoser/prevail-rules/domain';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  buttonVariants,
} from '@interface/components';
import { Link } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';

export function ArmiesPage(): JSX.Element {
  const armies = useOwnedArmiesQuery();
  const archive = useArchiveOwnedArmyMutation();

  return (
    <main class="container mx-auto flex flex-col gap-6 p-4 py-8">
      <div>
        <h1 class="font-display text-3xl tracking-wide">Armies</h1>
        <p class="text-muted-foreground text-sm">
          Owned armies for the authenticated player. Mode is chosen when you
          create or edit — composition legality is UI feedback only.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create</CardTitle>
          <CardDescription>
            Creates an empty army on the server, then opens the editor under the
            selected mode lens.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-wrap gap-2">
          <For each={[...gameModeNames]}>
            {(mode) => (
              <Link
                to="/armies/$gameMode/new"
                params={{ gameMode: mode }}
                class={buttonVariants()}
              >
                New {mode} army
              </Link>
            )}
          </For>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your armies</CardTitle>
          <CardDescription>
            Persist unit and command-card composition only. Pick a mode to edit
            against that mode’s rules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Show
            when={!armies.isLoading}
            fallback={
              <p class="text-muted-foreground text-sm">Loading armies…</p>
            }
          >
            <Show
              when={!armies.isError}
              fallback={
                <p class="text-destructive text-sm">
                  {armies.error instanceof Error
                    ? armies.error.message
                    : 'Failed to load armies.'}
                </p>
              }
            >
              <Show
                when={(armies.data?.length ?? 0) > 0}
                fallback={
                  <p class="text-muted-foreground text-sm">No armies yet.</p>
                }
              >
                <ul class="flex flex-col gap-3">
                  <For each={armies.data ?? []}>
                    {(army) => (
                      <li class="flex flex-col gap-3 rounded-md border border-border p-3">
                        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p class="font-medium">
                              {army.units[0]?.unitType.name ?? 'Empty army'}
                            </p>
                            <p class="text-muted-foreground text-xs">
                              {army.units.length} unit type(s) ·{' '}
                              {army.commandCards.length} command card(s)
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={archive.isPending}
                            onClick={() => {
                              archive.mutate(army.id);
                            }}
                          >
                            Archive
                          </Button>
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <For each={[...gameModeNames]}>
                            {(mode) => (
                              <Link
                                to="/armies/$gameMode/$armyId"
                                params={{
                                  gameMode: mode,
                                  armyId: army.id,
                                }}
                                class={buttonVariants({
                                  variant: 'outline',
                                  size: 'sm',
                                })}
                              >
                                Edit as {mode}
                              </Link>
                            )}
                          </For>
                        </div>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </Show>
          </Show>
        </CardContent>
      </Card>
    </main>
  );
}
