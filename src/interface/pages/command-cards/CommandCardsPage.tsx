import {
  useAllCommandCardsQuery,
  useCertifyLatestCommandCardVersionsMutation,
  useCreateEmptyCommandCardMutation,
  useDeleteEmptyCommandCardsMutation,
} from '@application';
import { CardCatalogPage } from '@interface/components';
import type { JSX } from 'solid-js';

export function CommandCardsPage(): JSX.Element {
  const catalog = useAllCommandCardsQuery();
  const createDraft = useCreateEmptyCommandCardMutation();
  const certify = useCertifyLatestCommandCardVersionsMutation();
  const cleanup = useDeleteEmptyCommandCardsMutation();

  return (
    <CardCatalogPage
      title="Command Cards"
      description="Author and publish command card versions."
      loadingMessage="Loading command cards…"
      emptyTitle="No command cards yet"
      emptyDescription="Create a draft to start authoring your first command card."
      loadErrorMessage="Failed to load command cards."
      kind="command"
      editRoute="/command-cards/$cardId"
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
