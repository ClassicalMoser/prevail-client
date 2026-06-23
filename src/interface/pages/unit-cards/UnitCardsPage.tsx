import {
  useCertifyLatestUnitCardVersionsMutation,
  useCreateEmptyUnitCardMutation,
  useCurrentUnitCardsQuery,
} from '@application';
import { Badge } from '@interface/components';
import { CardCatalogPage } from '@interface/components/authoring/card-catalog-page';
import { useNavigate } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';

export function UnitCardsPage(): JSX.Element {
  const cardsQuery = useCurrentUnitCardsQuery();
  const createDraftMutation = useCreateEmptyUnitCardMutation();
  const certifyMutation = useCertifyLatestUnitCardVersionsMutation();
  const navigate = useNavigate();

  const handleCreateDraft = (): void => {
    createDraftMutation.mutate(undefined, {
      onSuccess: async (cardId) => {
        await navigate({
          to: '/unit-cards/$cardId',
          params: { cardId },
        });
      },
    });
  };

  return (
    <CardCatalogPage
      title="Unit Cards"
      description="Author and publish unit type versions."
      loadingMessage="Loading unit cards…"
      emptyTitle="No unit cards yet"
      emptyDescription="Create a draft to start authoring your first unit card."
      loadErrorMessage="Failed to load unit cards."
      editRoute="/unit-cards/$cardId"
      query={cardsQuery}
      isCertifying={certifyMutation.isPending}
      onCertify={() => {
        certifyMutation.mutate();
      }}
      isCreatingDraft={createDraftMutation.isPending}
      onCreateDraft={handleCreateDraft}
      renderMetadataBadges={(unit) => (
        <Badge variant="outline">Cost {unit.cost}</Badge>
      )}
    />
  );
}
