import type { CertificationResults } from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { UseMutationResult } from '@tanstack/solid-query';
import { useMutation, useQueryClient } from '@tanstack/solid-query';
import { useUnitCards } from '@application/serverPortsContext';
import { unitCardKeys } from '../keys';

export function useCreateEmptyUnitCardMutation(): UseMutationResult<
  string,
  Error,
  void
> {
  const unitCards = useUnitCards();
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: () => unitCards.createDraft(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: unitCardKeys.lists() });
    },
  }));
}

export function useCreateUnitCardVersionMutation(): UseMutationResult<
  UnitType,
  Error,
  UnitType
> {
  const unitCards = useUnitCards();
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: (card: UnitType) => unitCards.publishVersion(card),
    onSuccess: async (_data, card) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: unitCardKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: unitCardKeys.detail(card.id),
        }),
      ]);
    },
  }));
}

export function useCertifyLatestUnitCardVersionsMutation(): UseMutationResult<
  CertificationResults,
  Error,
  void
> {
  const unitCards = useUnitCards();
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: () => unitCards.certifyLatest(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: unitCardKeys.lists() });
    },
  }));
}

export function usePreviewUnitCardMutation(): UseMutationResult<
  string,
  Error,
  UnitType
> {
  const unitCards = useUnitCards();

  return useMutation(() => ({
    mutationFn: (card: UnitType) => unitCards.preview(card),
  }));
}
