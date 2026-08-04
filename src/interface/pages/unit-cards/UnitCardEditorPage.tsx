import { useUnitCardEditor } from '@application';
import { CardPreviewPanel } from '@interface/components/authoring/card-preview-panel';
import { UnitCardForm } from '@interface/components/authoring/unit-cards/unit-card-form';
import { EditorToolbar } from '@interface/components/authoring/editor-toolbar';
import { Card, CardContent, buttonVariants } from '@interface/components';
import { Link, useParams } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

export function UnitCardEditorPage(): JSX.Element {
  const params = useParams({ from: '/admin/unit-cards/$cardId' });
  const editor = useUnitCardEditor(() => params().cardId);

  return (
    <main class="container mx-auto flex flex-col gap-6 p-4 py-8">
      <div class="flex items-center gap-2 text-sm">
        <Link
          to="/unit-cards"
          class={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          ← Unit Cards
        </Link>
      </div>

      <Show
        when={!editor.isLoading()}
        fallback={<p class="text-muted-foreground">Loading unit card…</p>}
      >
        <Show
          when={editor.draft()}
          fallback={
            <Card>
              <CardContent class="py-6">
                <p class="text-destructive text-sm">
                  {editor.loadErrorMessage() ?? 'Unit card not found.'}
                </p>
              </CardContent>
            </Card>
          }
        >
          {(unit) => (
            <>
              <EditorToolbar
                title={() => unit().name || 'Untitled Unit Card'}
                subtitle={() =>
                  editor.isNewVersion()
                    ? 'New version (unsaved)'
                    : `Version ${unit().version}`
                }
                isSaving={() => editor.publish.isPending}
                isPreviewing={() => editor.previewMutation.isPending}
                onSave={editor.save}
                onPreview={editor.preview}
              />

              <CardPreviewPanel
                svg={editor.previewSvg}
                errorMessage={editor.previewError}
              />

              <UnitCardForm
                unit={unit}
                onChange={(nextUnit) => {
                  editor.updateDraft(() => nextUnit);
                }}
              />
            </>
          )}
        </Show>
      </Show>
    </main>
  );
}
