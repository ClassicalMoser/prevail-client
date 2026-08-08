import {
  useAllUnitCardsQuery,
  useCertifyLatestUnitCardVersionsMutation,
  useCreateEmptyUnitCardMutation,
  useDeleteEmptyUnitCardsMutation,
} from '@application';
import { CardCatalogPage } from '@interface/components/authoring/card-catalog-page';
import type { JSX } from 'solid-js';

export function UnitCardsPage(): JSX.Element {
  const catalog = useAllUnitCardsQuery();
  const createDraft = useCreateEmptyUnitCardMutation();
  const certify = useCertifyLatestUnitCardVersionsMutation();
  const cleanup = useDeleteEmptyUnitCardsMutation();

  return (
    <CardCatalogPage
      title="Unit Cards"
      description="Author and publish unit type versions."
      loadingMessage="Loading unit cards…"
      emptyTitle="No unit cards yet"
      emptyDescription="Create a draft to start authoring your first unit card."
      loadErrorMessage="Failed to load unit cards."
      kind="unit"
      editRoute="/unit-cards/$cardId"
      isLoading={() => catalog.isLoading}
      isError={() => catalog.isError}
      errorMessage={() => catalog.error?.message}
      cards={() => catalog.data}
      hasEmptyCards={() =>
        (catalog.data ?? []).some((item) => item.version === null)
      }
      isCreatingDraft={() => createDraft.isPending}
      createDraft={() => {
        createDraft.mutate();
      }}
      isCertifying={() => certify.isPending}
      certify={() => {
        certify.mutate();
      }}
      isCleaningUp={() => cleanup.isPending}
      cleanupEmpty={() => {
        cleanup.mutate();
      }}
    />
  );
}
