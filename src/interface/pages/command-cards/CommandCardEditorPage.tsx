import { useCommandCardEditor, useCurrentUnitCardsQuery } from '@application';
import {
  Card,
  CardContent,
  CardPreviewPanel,
  CommandCardForm,
  EditorToolbar,
  buttonVariants,
} from '@interface/components';
import { Link, useParams } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';

export function CommandCardEditorPage(): JSX.Element {
  const params = useParams({ from: '/admin/command-cards/$cardId' });
  const editor = useCommandCardEditor(() => params().cardId);
  const unitCatalog = useCurrentUnitCardsQuery();

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
        when={!editor.isLoading()}
        fallback={<p class="text-muted-foreground">Loading command card…</p>}
      >
        <Show
          when={editor.draft()}
          fallback={
            <Card>
              <CardContent class="py-6">
                <p class="text-destructive text-sm">
                  {editor.loadErrorMessage() ?? 'Command card not found.'}
                </p>
              </CardContent>
            </Card>
          }
        >
          {(card) => (
            <>
              <EditorToolbar
                title={() => card().name || 'Untitled Command CommandCard'}
                subtitle={() =>
                  editor.isNewVersion()
                    ? 'New version (unsaved)'
                    : `Version ${card().version}`
                }
                isSaving={() => editor.publish.isPending}
                isPreviewing={() => editor.previewMutation.isPending}
                onSave={editor.save}
                onPreview={editor.preview}
              />

              <Show when={editor.validationErrors().length > 0}>
                <Card>
                  <CardContent class="py-6">
                    <p class="text-destructive text-sm font-medium">
                      Fix these issues before publishing or previewing:
                    </p>
                    <ul class="text-destructive mt-2 list-disc space-y-1 pl-5 text-sm">
                      <For each={editor.validationErrors()}>
                        {(message) => <li>{message}</li>}
                      </For>
                    </ul>
                  </CardContent>
                </Card>
              </Show>

              <Show when={editor.publish.error}>
                {(error) => (
                  <Card>
                    <CardContent class="py-6">
                      <p class="text-destructive text-sm">{error().message}</p>
                    </CardContent>
                  </Card>
                )}
              </Show>

              <CardPreviewPanel
                svg={editor.previewSvg}
                errorMessage={editor.previewError}
              />

              <CommandCardForm
                card={card}
                onChange={(nextCard) => {
                  editor.updateDraft(() => nextCard);
                }}
                unitCatalog={() => unitCatalog.data}
                isUnitCatalogLoading={() => unitCatalog.isLoading}
              />
            </>
          )}
        </Show>
      </Show>
    </main>
  );
}
