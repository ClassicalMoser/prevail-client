import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import { createEffect, createSignal } from 'solid-js';
import type { UseMutationResult, UseQueryResult } from '@tanstack/solid-query';
import {
  useAllUnitCardsQuery,
  useCreateUnitCardVersionMutation,
  usePreviewUnitCardMutation,
  useUnitCardByIdQuery,
} from '@application/queries';
import { cloneDraft } from './cloneDraft';
import {
  clearCardEditorSession,
  getCardEditorSession,
  setCardEditorSession,
} from './cardEditorSession';
import { defaultUnitCardDraft } from './cardDraftDefaults';
import { findCardListItem } from './findCardListItem';

function useUnitCardEditorState(
  cardId: Accessor<string | undefined>,
  catalog: UseQueryResult<CardListItem[], Error>,
): {
  isLoading: Accessor<boolean>;
  loadErrorMessage: Accessor<string | undefined>;
  draft: Accessor<UnitType | undefined>;
  isNewVersion: Accessor<boolean>;
  updateDraft: (updater: (unit: UnitType) => UnitType) => void;
  save: () => void;
  preview: () => void;
  previewSvg: Accessor<string | undefined>;
  previewError: Accessor<string | undefined>;
  publish: UseMutationResult<UnitType, Error, UnitType>;
  previewMutation: UseMutationResult<string, Error, UnitType>;
} {
  const version = useUnitCardByIdQuery(cardId, {
    enabled: () => {
      const resolvedId = cardId();
      if (resolvedId === undefined) {
        return false;
      }

      if (catalog.isLoading) {
        return false;
      }

      const item = findCardListItem(catalog.data, resolvedId);
      return item !== undefined && item.version !== null;
    },
  });
  const publish = useCreateUnitCardVersionMutation();
  const previewMutation = usePreviewUnitCardMutation();
  const [draft, setDraft] = createSignal<UnitType | undefined>();
  const [isNewVersion, setIsNewVersion] = createSignal(false);
  const [previewSvg, setPreviewSvg] = createSignal<string | undefined>();
  const [previewError, setPreviewError] = createSignal<string | undefined>();

  const listItem = () => {
    const resolvedId = cardId();
    if (resolvedId === undefined) {
      return;
    }

    return findCardListItem(catalog.data, resolvedId);
  };

  const isLoading = (): boolean => {
    const resolvedId = cardId();
    if (resolvedId === undefined) {
      return false;
    }

    if (getCardEditorSession(resolvedId) !== undefined) {
      return false;
    }

    if (catalog.isLoading) {
      return true;
    }

    const item = listItem();
    if (item === undefined || item.version === null) {
      return false;
    }

    return version.isLoading;
  };

  const loadErrorMessage = (): string | undefined => {
    if (catalog.isError) {
      return catalog.error?.message ?? 'Failed to load unit cards.';
    }

    const resolvedId = cardId();
    if (
      resolvedId !== undefined &&
      !catalog.isLoading &&
      listItem() === undefined
    ) {
      return 'Unit card not found.';
    }

    if (version.isError) {
      return version.error?.message ?? 'Failed to load unit card.';
    }

    return undefined;
  };

  createEffect(() => {
    const resolvedId = cardId();

    if (resolvedId === undefined) {
      setDraft(undefined);
      setIsNewVersion(false);
      return;
    }

    const session = getCardEditorSession<UnitType>(resolvedId);
    if (session !== undefined) {
      setIsNewVersion(session.isNewVersion);
      setDraft(cloneDraft(session.draft));
      return;
    }

    if (catalog.isLoading) {
      setDraft(undefined);
      return;
    }

    const item = listItem();
    if (item === undefined) {
      setDraft(undefined);
      setIsNewVersion(false);
      return;
    }

    if (item.version === null) {
      setIsNewVersion(true);
      setDraft(cloneDraft(defaultUnitCardDraft(resolvedId)));
      setPreviewSvg(undefined);
      setPreviewError(undefined);
      return;
    }

    if (version.isLoading) {
      setDraft(undefined);
      return;
    }

    const loadedVersion = version.data;
    if (loadedVersion !== undefined) {
      setIsNewVersion(false);
      setDraft(cloneDraft(loadedVersion));
      setPreviewSvg(undefined);
      setPreviewError(undefined);
    }
  });

  const updateDraft = (updater: (unit: UnitType) => UnitType): void => {
    const current = draft();
    if (current !== undefined) {
      const next = updater(current);
      setDraft(next);
      setCardEditorSession(current.id, {
        draft: cloneDraft(next),
        isNewVersion: isNewVersion(),
      });
    }
  };

  const save = (): void => {
    const current = draft();
    if (current !== undefined) {
      publish.mutate(current, {
        onSuccess: (saved) => {
          clearCardEditorSession(saved.id);
          setDraft(cloneDraft(saved));
          setIsNewVersion(false);
        },
      });
    }
  };

  const preview = (): void => {
    const current = draft();
    if (current !== undefined) {
      setPreviewError(undefined);
      previewMutation.mutate(current, {
        onSuccess: (svg) => {
          setPreviewSvg(svg);
        },
        onError: (error) => {
          setPreviewSvg(undefined);
          setPreviewError(error.message);
        },
      });
    }
  };

  return {
    isLoading,
    loadErrorMessage,
    draft,
    isNewVersion,
    updateDraft,
    save,
    preview,
    previewSvg,
    previewError,
    publish,
    previewMutation,
  };
}

/**
 * Local draft editor for a unit card loaded by id.
 * Uses the catalog list to decide whether to fetch a version or seed defaults.
 */
export function useUnitCardEditor(
  cardId: Accessor<string | undefined>,
): ReturnType<typeof useUnitCardEditorState> {
  const catalog = useAllUnitCardsQuery();
  return useUnitCardEditorState(cardId, catalog);
}
