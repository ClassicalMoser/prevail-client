import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import type { UseMutationResult, UseQueryResult } from '@tanstack/solid-query';
import { createEffect, createSignal } from 'solid-js';
import {
  useCommandCardByIdQuery,
  useCreateCommandCardVersionMutation,
  usePreviewCommandCardMutation,
} from '@application/queries';
import { cloneDraft } from './cloneDraft';

/**
 * Local draft editor for a command card loaded by id.
 * Keeps mutable form state separate from the TanStack Query cache.
 */
export function useCommandCardEditor(cardId: Accessor<string | undefined>): {
  query: UseQueryResult<Card, Error>;
  draft: () => Card | undefined;
  updateDraft: (updater: (card: Card) => Card) => void;
  save: () => void;
  preview: () => void;
  previewSvg: () => string | undefined;
  previewError: () => string | undefined;
  publishMutation: UseMutationResult<Card, Error, Card>;
  previewMutation: UseMutationResult<string, Error, Card>;
} {
  const query = useCommandCardByIdQuery(cardId);
  const publishMutation = useCreateCommandCardVersionMutation();
  const previewMutation = usePreviewCommandCardMutation();
  const [draft, setDraft] = createSignal<Card | undefined>();
  const [previewSvg, setPreviewSvg] = createSignal<string | undefined>();
  const [previewError, setPreviewError] = createSignal<string | undefined>();

  // Seed local draft whenever server data arrives for the current card.
  createEffect(() => {
    const data = query.data;
    if (data !== undefined) {
      setDraft(cloneDraft(data));
      setPreviewSvg(undefined);
      setPreviewError(undefined);
    }
  });

  const updateDraft = (updater: (card: Card) => Card): void => {
    const current = draft();
    if (current !== undefined) {
      setDraft(updater(current));
    }
  };

  const save = (): void => {
    const current = draft();
    if (current !== undefined) {
      publishMutation.mutate(current);
    }
  };

  const preview = (): void => {
    const current = draft();
    if (current !== undefined) {
      setPreviewError(undefined);
      // Preview is server-rendered SVG; keep result out of the query cache.
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
    query,
    draft,
    updateDraft,
    save,
    preview,
    previewSvg,
    previewError,
    publishMutation,
    previewMutation,
  };
}
