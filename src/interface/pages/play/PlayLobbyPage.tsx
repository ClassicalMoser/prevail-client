import {
  useCreateVsBotGameMutation,
  useOwnedArmiesQuery,
  validateArmyForMode,
} from '@application';
import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import type { Army, PlayerSide } from '@classicalmoser/prevail-rules/domain';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@interface/components';
import { useNavigate } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { createMemo, createSignal, For, Show } from 'solid-js';

const PLAY_MODE = 'mini' as const;

function armyOptionLabel(army: Army): string {
  const units = army.units.length;
  const cards = army.commandCards.length;
  return `${army.id.slice(0, 8)}… (${units} units, ${cards} cards)`;
}

function softArmyWarnings(army: Army | undefined): string[] {
  if (army === undefined) {
    return ['Select an army.'];
  }
  const messages: string[] = [];
  if (army.units.length === 0 || army.commandCards.length === 0) {
    messages.push('Army looks empty (units and command cards required).');
  }
  const modeCheck = validateArmyForMode(army, PLAY_MODE);
  if (!modeCheck.success) {
    messages.push(
      `May not satisfy mini composition: ${modeCheck.messages[0] ?? 'invalid'}`,
    );
  }
  return messages;
}

export function PlayLobbyPage(): JSX.Element {
  const armiesQuery = useOwnedArmiesQuery();
  const createGame = useCreateVsBotGameMutation();
  const navigate = useNavigate();

  const [humanSide, setHumanSide] = createSignal<PlayerSide>('white');
  const [whiteArmyId, setWhiteArmyId] = createSignal('');
  const [blackArmyId, setBlackArmyId] = createSignal('');

  const armies = createMemo(() => armiesQuery.data ?? []);
  const whiteArmy = createMemo(() =>
    armies().find((army) => army.id === whiteArmyId()),
  );
  const blackArmy = createMemo(() =>
    armies().find((army) => army.id === blackArmyId()),
  );
  const whiteWarnings = createMemo(() => softArmyWarnings(whiteArmy()));
  const blackWarnings = createMemo(() => softArmyWarnings(blackArmy()));

  const canSubmit = createMemo(
    () => whiteArmyId() !== '' && blackArmyId() !== '' && !createGame.isPending,
  );

  const handleCreate = () => {
    const body: CreateVsBotGameBody = {
      humanSide: humanSide(),
      gameMode: PLAY_MODE,
      whiteArmyId: whiteArmyId(),
      blackArmyId: blackArmyId(),
    };
    createGame.mutate(body, {
      onSuccess: (createdGameId) => {
        navigate({
          to: '/play/$gameId/$side',
          params: { gameId: createdGameId, side: humanSide() },
        });
      },
      onError: (error) => {
        console.error(error);
      },
    });
  };

  return (
    <main class="container mx-auto flex max-w-2xl flex-col gap-6 p-4 py-8">
      <div>
        <h1 class="font-display text-3xl tracking-wide">Play</h1>
        <p class="text-muted-foreground text-sm">
          Create a mini human-vs-bot game. You supply both army ids; the server
          seats the bot on the opposite side.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mini vs bot</CardTitle>
          <CardDescription>
            Mode is fixed to mini. Soft client checks warn only — the server
            still validates armies.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <Show
            when={!armiesQuery.isLoading}
            fallback={
              <p class="text-muted-foreground text-sm">Loading armies…</p>
            }
          >
            <Show
              when={!armiesQuery.isError}
              fallback={
                <p class="text-destructive text-sm">
                  {armiesQuery.error instanceof Error
                    ? armiesQuery.error.message
                    : 'Failed to load armies.'}
                </p>
              }
            >
              <Show
                when={armies().length > 0}
                fallback={
                  <p class="text-muted-foreground text-sm">
                    You need at least one owned army. Create armies under Armies
                    first (ideally two mini-legal lists).
                  </p>
                }
              >
                <label class="flex flex-col gap-1 text-sm">
                  <span class="font-medium">Your side</span>
                  <select
                    class="border-input bg-background rounded-md border px-3 py-2"
                    value={humanSide()}
                    onChange={(event) =>
                      setHumanSide(event.currentTarget.value as PlayerSide)
                    }
                  >
                    <option value="white">White</option>
                    <option value="black">Black</option>
                  </select>
                </label>

                <label class="flex flex-col gap-1 text-sm">
                  <span class="font-medium">White army</span>
                  <select
                    class="border-input bg-background rounded-md border px-3 py-2"
                    value={whiteArmyId()}
                    onChange={(event) =>
                      setWhiteArmyId(event.currentTarget.value)
                    }
                  >
                    <option value="">Select army…</option>
                    <For each={armies()}>
                      {(army) => (
                        <option value={army.id}>{armyOptionLabel(army)}</option>
                      )}
                    </For>
                  </select>
                  <For each={whiteWarnings()}>
                    {(warning) => (
                      <span class="text-destructive text-xs">{warning}</span>
                    )}
                  </For>
                </label>

                <label class="flex flex-col gap-1 text-sm">
                  <span class="font-medium">Black army</span>
                  <select
                    class="border-input bg-background rounded-md border px-3 py-2"
                    value={blackArmyId()}
                    onChange={(event) =>
                      setBlackArmyId(event.currentTarget.value)
                    }
                  >
                    <option value="">Select army…</option>
                    <For each={armies()}>
                      {(army) => (
                        <option value={army.id}>{armyOptionLabel(army)}</option>
                      )}
                    </For>
                  </select>
                  <For each={blackWarnings()}>
                    {(warning) => (
                      <span class="text-destructive text-xs">{warning}</span>
                    )}
                  </For>
                </label>

                <Show when={createGame.isError}>
                  <p class="text-destructive text-sm">
                    {createGame.error instanceof Error
                      ? createGame.error.message
                      : 'Failed to create game.'}
                  </p>
                </Show>

                <Button
                  type="button"
                  disabled={!canSubmit()}
                  onClick={handleCreate}
                >
                  {createGame.isPending ? 'Creating…' : 'Start vs bot'}
                </Button>
              </Show>
            </Show>
          </Show>
        </CardContent>
      </Card>
    </main>
  );
}
