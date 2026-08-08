import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { UseMutationResult } from '@tanstack/solid-query';
import { useMutation, useQueryClient } from '@tanstack/solid-query';
import { useArmies } from '@application/serverPortsContext';
import { armyKeys } from '../keys';

export function useCreateOwnedArmyMutation(): UseMutationResult<
  string,
  Error,
  void
> {
  const armies = useArmies();
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: () => armies.create(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: armyKeys.lists });
    },
  }));
}

export function useUpdateOwnedArmyMutation(): UseMutationResult<
  void,
  Error,
  Army
> {
  const armies = useArmies();
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: (army: Army) => {
      const { id, units, commandCards } = army;
      return armies.update(id, { units, commandCards });
    },
    onSettled: (_data, _error, army) => {
      queryClient.invalidateQueries({ queryKey: armyKeys.lists });
      queryClient.invalidateQueries({
        queryKey: armyKeys.detail(army.id),
      });
    },
  }));
}

export function useArchiveOwnedArmyMutation(): UseMutationResult<
  void,
  Error,
  string
> {
  const armies = useArmies();
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: (id: string) => armies.archive(id),
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: armyKeys.lists });
      queryClient.invalidateQueries({ queryKey: armyKeys.detail(id) });
    },
  }));
}
