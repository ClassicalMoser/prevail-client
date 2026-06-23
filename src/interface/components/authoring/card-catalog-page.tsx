import type { UseQueryResult } from '@tanstack/solid-query';
import type { JSX } from 'solid-js';
import { CardCatalogContent } from './card-catalog-content';
import { CardCatalogHeader } from './card-catalog-header';
import type { CardCatalogItem } from './card-catalog-types';

export type { CardCatalogItem } from './card-catalog-types';

export interface CardCatalogPageProps<TItem extends CardCatalogItem> {
  title: string;
  description: string;
  loadingMessage: string;
  emptyTitle: string;
  emptyDescription: string;
  loadErrorMessage: string;
  editRoute: '/command-cards/$cardId' | '/unit-cards/$cardId';
  query: UseQueryResult<TItem[], Error>;
  isCertifying: boolean;
  onCertify: () => void;
  isCreatingDraft: boolean;
  onCreateDraft: () => void;
  renderMetadataBadges: (item: TItem) => JSX.Element;
}

/** List page shell shared by command and unit card authoring catalogs. */
export const CardCatalogPage = <TItem extends CardCatalogItem>(
  props: CardCatalogPageProps<TItem>,
): JSX.Element => (
  <main class="container mx-auto flex flex-col gap-6 p-4 py-8">
    <CardCatalogHeader
      title={props.title}
      description={props.description}
      isCertifying={props.isCertifying}
      onCertify={props.onCertify}
      isCreatingDraft={props.isCreatingDraft}
      onCreateDraft={props.onCreateDraft}
    />
    <CardCatalogContent
      query={props.query}
      loadingMessage={props.loadingMessage}
      emptyTitle={props.emptyTitle}
      emptyDescription={props.emptyDescription}
      loadErrorMessage={props.loadErrorMessage}
      editRoute={props.editRoute}
      renderMetadataBadges={props.renderMetadataBadges}
    />
  </main>
);
