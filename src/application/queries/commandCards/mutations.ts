import type { CertificationResults } from '@classicalmoser/prevail-contracts';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { useMutation, useQueryClient } from '@tanstack/solid-query';
import type { UseMutationResult } from '@tanstack/solid-query';
import { useCommandCards } from '@application/serverPortsContext';
import { commandCardKeys } from '../keys';

function useCreateEmptyCommandCardMutation(): UseMutationResult<
  string,
  Error,
  void
> {
  const commandCards = useCommandCards();
  const queryClient = useQueryClient();

  return useMutation(
    (): { mutationFn: () => Promise<string>; onSettled: () => void } => ({
      mutationFn: (): Promise<string> => commandCards.createDraft(),
      onSettled: (): void => {
        queryClient.invalidateQueries({ queryKey: commandCardKeys.lists });
      },
    }),
  );
}

function useCreateCommandCardVersionMutation(): UseMutationResult<
  CommandCard,
  Error,
  CommandCard
> {
  const commandCards = useCommandCards();
  const queryClient = useQueryClient();

  return useMutation(
    (): {
      mutationFn: (card: CommandCard) => Promise<CommandCard>;
      onSettled: (
        _data: CommandCard | undefined,
        _error: Error | null,
        card: CommandCard,
      ) => void;
    } => ({
      mutationFn: (card: CommandCard): Promise<CommandCard> =>
        commandCards.publishVersion(card),
      onSettled: (_data, _error, card): void => {
        queryClient.invalidateQueries({ queryKey: commandCardKeys.lists });
        queryClient.invalidateQueries({
          queryKey: commandCardKeys.detail(card.id),
        });
      },
    }),
  );
}

function useCertifyLatestCommandCardVersionsMutation(): UseMutationResult<
  CertificationResults,
  Error,
  void
> {
  const commandCards = useCommandCards();
  const queryClient = useQueryClient();

  return useMutation(
    (): {
      mutationFn: () => Promise<CertificationResults>;
      onSettled: () => void;
    } => ({
      mutationFn: (): Promise<CertificationResults> =>
        commandCards.certifyLatest(),
      onSettled: (): void => {
        queryClient.invalidateQueries({ queryKey: commandCardKeys.lists });
      },
    }),
  );
}

function useDeleteEmptyCommandCardsMutation(): UseMutationResult<
  void,
  Error,
  void
> {
  const commandCards = useCommandCards();
  const queryClient = useQueryClient();

  return useMutation(
    (): { mutationFn: () => Promise<void>; onSettled: () => void } => ({
      mutationFn: (): Promise<void> => commandCards.deleteEmpty(),
      onSettled: (): void => {
        queryClient.invalidateQueries({ queryKey: commandCardKeys.lists });
      },
    }),
  );
}

function usePreviewCommandCardMutation(): UseMutationResult<
  string,
  Error,
  CommandCard
> {
  const commandCards = useCommandCards();

  return useMutation(
    (): { mutationFn: (card: CommandCard) => Promise<string> } => ({
      mutationFn: (card: CommandCard): Promise<string> =>
        commandCards.preview(card),
    }),
  );
}

export {
  useCreateEmptyCommandCardMutation,
  useCreateCommandCardVersionMutation,
  useCertifyLatestCommandCardVersionsMutation,
  useDeleteEmptyCommandCardsMutation,
  usePreviewCommandCardMutation,
};
