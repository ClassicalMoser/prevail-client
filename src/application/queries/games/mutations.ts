import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import { useMutation } from '@tanstack/solid-query';
import type { UseMutationResult } from '@tanstack/solid-query';
import { useGames } from '@application/serverPortsContext';

export function useCreateVsBotGameMutation(): UseMutationResult<
  string,
  Error,
  CreateVsBotGameBody
> {
  const games = useGames();

  return useMutation(
    (): { mutationFn: (body: CreateVsBotGameBody) => Promise<string> } => ({
      mutationFn: (body: CreateVsBotGameBody): Promise<string> =>
        games.createVsBot(body),
    }),
  );
}
