import {
  useCertifyLatestCommandCardVersionsMutation,
  useCreateEmptyCommandCardMutation,
  useCurrentCommandCardsQuery,
} from '@application';
import { Badge } from '@interface/components';
import { CardCatalogPage } from '@interface/components/authoring/card-catalog-page';
import { useNavigate } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';

export function CommandCardsPage(): JSX.Element {
  const cardsQuery = useCurrentCommandCardsQuery();
  const createDraftMutation = useCreateEmptyCommandCardMutation();
  const certifyMutation = useCertifyLatestCommandCardVersionsMutation();
  const navigate = useNavigate();

  const handleCreateDraft = (): void => {
    createDraftMutation.mutate(undefined, {
      onSuccess: async (cardId) => {
        await navigate({
          to: '/command-cards/$cardId',
          params: { cardId },
        });
      },
    });
  };

  return (
    <CardCatalogPage
      title="Command Cards"
      description="Author and publish command card versions."
      loadingMessage="Loading command cards…"
      emptyTitle="No command cards yet"
      emptyDescription="Create a draft to start authoring your first command card."
      loadErrorMessage="Failed to load command cards."
      editRoute="/command-cards/$cardId"
      query={cardsQuery}
      isCertifying={certifyMutation.isPending}
      onCertify={() => {
        certifyMutation.mutate();
      }}
      isCreatingDraft={createDraftMutation.isPending}
      onCreateDraft={handleCreateDraft}
      renderMetadataBadges={(card) => (
        <Badge variant="outline">Initiative {card.initiative}</Badge>
      )}
    />
  );
}
