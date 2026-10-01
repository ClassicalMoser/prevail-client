import type { CertificationResults } from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import { useMutation, useQueryClient } from '@tanstack/solid-query';
import type { UseMutationResult } from '@tanstack/solid-query';
import { useUnitCards } from '@application/serverPortsContext';
import { unitCardKeys } from '../keys';

function useCreateEmptyUnitCardMutation(): UseMutationResult<
  string,
  Error,
  void
> {
  const unitCards = useUnitCards();
  const queryClient = useQueryClient();

  return useMutation(
    (): { mutationFn: () => Promise<string>; onSettled: () => void } => ({
      mutationFn: (): Promise<string> => unitCards.createDraft(),
      onSettled: (): void => {
        queryClient.invalidateQueries({ queryKey: unitCardKeys.all });
      },
    }),
  );
}

function useCreateUnitCardVersionMutation(): UseMutationResult<
  UnitType,
  Error,
  UnitType
> {
  const unitCards = useUnitCards();
  const queryClient = useQueryClient();

  return useMutation(
    (): {
      mutationFn: (card: UnitType) => Promise<UnitType>;
      onSettled: (
        _data: UnitType | undefined,
        _error: Error | null,
        card: UnitType,
      ) => void;
    } => ({
      mutationFn: (card: UnitType): Promise<UnitType> =>
        unitCards.publishVersion(card),
      onSettled: (_data, _error, card): void => {
        queryClient.invalidateQueries({ queryKey: unitCardKeys.all });
        queryClient.invalidateQueries({
          queryKey: unitCardKeys.detail(card.id),
        });
      },
    }),
  );
}

function useCertifyLatestUnitCardVersionsMutation(): UseMutationResult<
  CertificationResults,
  Error,
  void
> {
  const unitCards = useUnitCards();
  const queryClient = useQueryClient();

  return useMutation(
    (): {
      mutationFn: () => Promise<CertificationResults>;
      onSettled: () => void;
    } => ({
      mutationFn: (): Promise<CertificationResults> =>
        unitCards.certifyLatest(),
      onSettled: (): void => {
        queryClient.invalidateQueries({ queryKey: unitCardKeys.all });
      },
    }),
  );
}

function useDeleteEmptyUnitCardsMutation(): UseMutationResult<
  void,
  Error,
  void
> {
  const unitCards = useUnitCards();
  const queryClient = useQueryClient();

  return useMutation(
    (): { mutationFn: () => Promise<void>; onSettled: () => void } => ({
      mutationFn: (): Promise<void> => unitCards.deleteEmpty(),
      onSettled: (): void => {
        queryClient.invalidateQueries({ queryKey: unitCardKeys.all });
      },
    }),
  );
}

function usePreviewUnitCardMutation(): UseMutationResult<
  string,
  Error,
  UnitType
> {
  const unitCards = useUnitCards();

  return useMutation(
    (): { mutationFn: (card: UnitType) => Promise<string> } => ({
      mutationFn: (card: UnitType): Promise<string> => unitCards.preview(card),
    }),
  );
}

export {
  useCreateEmptyUnitCardMutation,
  useCreateUnitCardVersionMutation,
  useCertifyLatestUnitCardVersionsMutation,
  useDeleteEmptyUnitCardsMutation,
  usePreviewUnitCardMutation,
};
