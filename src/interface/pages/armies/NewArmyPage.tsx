import { isGameModeName, useCreateOwnedArmyMutation } from '@application';
import { useNavigate, useParams } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { createSignal, onMount, Show } from 'solid-js';

/** Creates an owned army, then opens the editor under the route mode lens. */
export function NewArmyPage(): JSX.Element {
  const params = useParams({ from: '/admin/armies/$gameMode/new' });
  const create = useCreateOwnedArmyMutation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = createSignal<string | undefined>();

  onMount(() => {
    const mode = params().gameMode;
    if (!isGameModeName(mode)) {
      navigate({ to: '/armies' });
      return;
    }

    create.mutate(undefined, {
      onSuccess: (armyId) => {
        navigate({
          to: '/armies/$gameMode/$armyId',
          params: { gameMode: mode, armyId },
          replace: true,
        });
      },
      onError: (error) => {
        console.error(error);
        setErrorMessage(error.message);
      },
    });
  });

  return (
    <Show
      when={errorMessage()}
      fallback={<p class="text-muted-foreground p-4">Creating army…</p>}
    >
      {(message) => <p class="text-destructive p-4">{message()}</p>}
    </Show>
  );
}
