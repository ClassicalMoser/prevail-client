import type { Army } from '@classicalmoser/prevail-rules/domain';
import { useMutation, useQueryClient } from '@tanstack/solid-query';
import type { MutationOptions, UseMutationResult } from '@tanstack/solid-query';
import { useArmies } from '@application/serverPortsContext';
import { armyKeys } from '../keys';

function useCreateOwnedArmyMutation(): UseMutationResult<string, Error, void> {
  const armies = useArmies();
  const queryClient = useQueryClient();

  return useMutation(
    (): { mutationFn: () => Promise<string>; onSettled: () => void } => ({
      mutationFn: (): Promise<string> => armies.create(),
      onSettled: (): void => {
        queryClient.invalidateQueries({ queryKey: armyKeys.lists });
      },
    }),
  );
}

function useUpdateOwnedArmyMutation(): UseMutationResult<void, Error, Army> {
  const armies = useArmies();
  const queryClient = useQueryClient();

  return useMutation(
    (): MutationOptions<void, Error, Army> => ({
      mutationFn: (army: Army): Promise<void> => {
        const { id, units, commandCards } = army;
        return armies.update(id, { units, commandCards });
      },
      onSettled: (_data, _error, army): void => {
        queryClient.invalidateQueries({ queryKey: armyKeys.lists });
        queryClient.invalidateQueries({
          queryKey: armyKeys.detail(army.id),
        });
      },
    }),
  );
}

function useArchiveOwnedArmyMutation(): UseMutationResult<void, Error, string> {
  const armies = useArmies();
  const queryClient = useQueryClient();

  return useMutation(
    (): MutationOptions<void, Error, string> => ({
      mutationFn: (id: string): Promise<void> => armies.archive(id),
      onSettled: (_data, _error, id): void => {
        queryClient.invalidateQueries({ queryKey: armyKeys.lists });
        queryClient.invalidateQueries({ queryKey: armyKeys.detail(id) });
      },
    }),
  );
}

export {
  useCreateOwnedArmyMutation,
  useUpdateOwnedArmyMutation,
  useArchiveOwnedArmyMutation,
};
