import { useCommandCardEditor } from '@application';
import { CardPreviewPanel } from '@interface/components/authoring/card-preview-panel';
import { CommandCardForm } from '@interface/components/authoring/command-cards/command-card-form';
import { EditorToolbar } from '@interface/components/authoring/editor-toolbar';
import { Card, CardContent, buttonVariants } from '@interface/components';
import { Link, useParams } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

export function CommandCardEditorPage(): JSX.Element {
  const params = useParams({ from: '/command-cards/$cardId' });
  const editor = useCommandCardEditor(() => params().cardId);

  return (
    <main class="container mx-auto flex flex-col gap-6 p-4 py-8">
      <div class="flex items-center gap-2 text-sm">
        <Link
          to="/command-cards"
          class={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          ← Command Cards
        </Link>
      </div>

      <Show
        when={!editor.query.isLoading}
        fallback={<p class="text-muted-foreground">Loading command card…</p>}
      >
        <Show
          when={editor.query.isError}
          fallback={
            <Show
              when={editor.draft()}
              fallback={
                <Card>
                  <CardContent class="py-6">
                    <p class="text-muted-foreground text-sm">
                      Command card not found.
                    </p>
                  </CardContent>
                </Card>
              }
            >
              {(card) => (
                <>
                  <EditorToolbar
                    title={card().name || 'Untitled Command Card'}
                    subtitle={`Version ${card().version}`}
                    isSaving={editor.publishMutation.isPending}
                    isPreviewing={editor.previewMutation.isPending}
                    onSave={editor.save}
                    onPreview={editor.preview}
                  />

                  <CardPreviewPanel
                    svg={editor.previewSvg()}
                    errorMessage={editor.previewError()}
                  />

                  <CommandCardForm
                    card={card()}
                    onChange={(nextCard) => {
                      editor.updateDraft(() => nextCard);
                    }}
                  />
                </>
              )}
            </Show>
          }
        >
          <Card>
            <CardContent class="py-6">
              <p class="text-destructive text-sm">
                {editor.query.error?.message ?? 'Failed to load command card.'}
              </p>
            </CardContent>
          </Card>
        </Show>
      </Show>
    </main>
  );
}
