import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import { createEffect, createSignal } from 'solid-js';
import type { UseMutationResult, UseQueryResult } from '@tanstack/solid-query';
import {
  useAllCommandCardsQuery,
  useCommandCardByIdQuery,
  useCreateCommandCardVersionMutation,
  usePreviewCommandCardMutation,
} from '@application/queries';
import { cloneDraft } from './cloneDraft';
import {
  clearCardEditorSession,
  getCardEditorSession,
  setCardEditorSession,
} from './cardEditorSession';
import { defaultCommandCardDraft } from './cardDraftDefaults';
import { findCardListItem } from './findCardListItem';
import { validateCommandCardDraft } from './validateCommandCardDraft';

function useCommandCardEditorState(
  cardId: Accessor<string | undefined>,
  catalog: UseQueryResult<CardListItem[], Error>,
): {
  isLoading: Accessor<boolean>;
  loadErrorMessage: Accessor<string | undefined>;
  draft: Accessor<CommandCard | undefined>;
  isNewVersion: Accessor<boolean>;
  updateDraft: (updater: (card: CommandCard) => CommandCard) => void;
  save: () => void;
  preview: () => void;
  previewSvg: Accessor<string | undefined>;
  previewError: Accessor<string | undefined>;
  validationErrors: Accessor<readonly string[]>;
  publish: UseMutationResult<CommandCard, Error, CommandCard>;
  previewMutation: UseMutationResult<string, Error, CommandCard>;
} {
  const version = useCommandCardByIdQuery(cardId, {
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
  const publish = useCreateCommandCardVersionMutation();
  const previewMutation = usePreviewCommandCardMutation();
  const [draft, setDraft] = createSignal<CommandCard | undefined>();
  const [isNewVersion, setIsNewVersion] = createSignal(false);
  const [previewSvg, setPreviewSvg] = createSignal<string | undefined>();
  const [previewError, setPreviewError] = createSignal<string | undefined>();
  const [validationErrors, setValidationErrors] = createSignal<
    readonly string[]
  >([]);

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
      return catalog.error?.message ?? 'Failed to load command cards.';
    }

    const resolvedId = cardId();
    if (
      resolvedId !== undefined &&
      !catalog.isLoading &&
      listItem() === undefined
    ) {
      return 'Command card not found.';
    }

    if (version.isError) {
      return version.error?.message ?? 'Failed to load command card.';
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

    const session = getCardEditorSession<CommandCard>(resolvedId);
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
      setDraft(cloneDraft(defaultCommandCardDraft(resolvedId)));
      setPreviewSvg(undefined);
      setPreviewError(undefined);
      setValidationErrors([]);
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
      setValidationErrors([]);
    }
  });

  const updateDraft = (updater: (card: CommandCard) => CommandCard): void => {
    const current = draft();
    if (current !== undefined) {
      const next = updater(current);
      setDraft(next);
      setValidationErrors([]);
      setCardEditorSession(current.id, {
        draft: cloneDraft(next),
        isNewVersion: isNewVersion(),
      });
    }
  };

  const save = (): void => {
    const current = draft();
    if (current === undefined) {
      return;
    }

    const validation = validateCommandCardDraft(current);
    if (!validation.success) {
      setValidationErrors(validation.messages);
      return;
    }

    setValidationErrors([]);
    publish.mutate(validation.data, {
      onSuccess: (saved) => {
        clearCardEditorSession(saved.id);
        setDraft(cloneDraft(saved));
        setIsNewVersion(false);
      },
    });
  };

  const preview = (): void => {
    const current = draft();
    if (current === undefined) {
      return;
    }

    const validation = validateCommandCardDraft(current);
    if (!validation.success) {
      setValidationErrors(validation.messages);
      setPreviewError(undefined);
      return;
    }

    setValidationErrors([]);
    setPreviewError(undefined);
    previewMutation.mutate(validation.data, {
      onSuccess: (svg) => {
        setPreviewSvg(svg);
      },
      onError: (error) => {
        setPreviewSvg(undefined);
        setPreviewError(error.message);
      },
    });
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
    validationErrors,
    publish,
    previewMutation,
  };
}

/**
 * Local draft editor for a command card loaded by id.
 * Uses the catalog list to decide whether to fetch a version or seed defaults.
 */
export function useCommandCardEditor(
  cardId: Accessor<string | undefined>,
): ReturnType<typeof useCommandCardEditorState> {
  const catalog = useAllCommandCardsQuery();
  return useCommandCardEditorState(cardId, catalog);
}
