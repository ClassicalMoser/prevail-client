import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { Accessor } from 'solid-js';
import type { UseMutationResult, UseQueryResult } from '@tanstack/solid-query';
import { createEffect, createSignal } from 'solid-js';
import {
  useCreateUnitCardVersionMutation,
  usePreviewUnitCardMutation,
  useUnitCardByIdQuery,
} from '@application/queries';
import { cloneDraft } from './cloneDraft';

/**
 * Local draft editor for a unit card loaded by id.
 * Keeps mutable form state separate from the TanStack Query cache.
 */
export function useUnitCardEditor(cardId: Accessor<string | undefined>): {
  query: UseQueryResult<UnitType, Error>;
  draft: () => UnitType | undefined;
  updateDraft: (updater: (unit: UnitType) => UnitType) => void;
  save: () => void;
  preview: () => void;
  previewSvg: () => string | undefined;
  previewError: () => string | undefined;
  publishMutation: UseMutationResult<UnitType, Error, UnitType>;
  previewMutation: UseMutationResult<string, Error, UnitType>;
} {
  const query = useUnitCardByIdQuery(cardId);
  const publishMutation = useCreateUnitCardVersionMutation();
  const previewMutation = usePreviewUnitCardMutation();
  const [draft, setDraft] = createSignal<UnitType | undefined>();
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

  const updateDraft = (updater: (unit: UnitType) => UnitType): void => {
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
