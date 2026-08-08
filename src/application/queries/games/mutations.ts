import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import type { UseMutationResult } from '@tanstack/solid-query';
import { useMutation } from '@tanstack/solid-query';
import { useGames } from '@application/serverPortsContext';

export function useCreateVsBotGameMutation(): UseMutationResult<
  string,
  Error,
  CreateVsBotGameBody
> {
  const games = useGames();

  return useMutation(() => ({
    mutationFn: (body: CreateVsBotGameBody) => games.createVsBot(body),
  }));
}
