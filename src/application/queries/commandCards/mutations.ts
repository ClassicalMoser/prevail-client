import type { CertificationResults } from '@classicalmoser/prevail-contracts';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { UseMutationResult } from '@tanstack/solid-query';
import { useMutation, useQueryClient } from '@tanstack/solid-query';
import { useCommandCards } from '@application/serverPortsContext';
import { commandCardKeys } from '../keys';

export function useCreateEmptyCommandCardMutation(): UseMutationResult<
  string,
  Error,
  void
> {
  const commandCards = useCommandCards();
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: () => commandCards.createDraft(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: commandCardKeys.lists(),
      });
    },
  }));
}

export function useCreateCommandCardVersionMutation(): UseMutationResult<
  Card,
  Error,
  Card
> {
  const commandCards = useCommandCards();
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: (card: Card) => commandCards.publishVersion(card),
    onSuccess: async (_data, card) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: commandCardKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: commandCardKeys.detail(card.id),
        }),
      ]);
    },
  }));
}

export function useCertifyLatestCommandCardVersionsMutation(): UseMutationResult<
  CertificationResults,
  Error,
  void
> {
  const commandCards = useCommandCards();
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: () => commandCards.certifyLatest(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: commandCardKeys.lists(),
      });
    },
  }));
}

export function usePreviewCommandCardMutation(): UseMutationResult<
  string,
  Error,
  Card
> {
  const commandCards = useCommandCards();

  return useMutation(() => ({
    mutationFn: (card: Card) => commandCards.preview(card),
  }));
}
