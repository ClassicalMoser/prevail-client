import {
  isGameModeName,
  useArmyEditor,
  useCurrentCommandCardsQuery,
  useCurrentUnitCardsQuery,
} from '@application';
import {
  ArmyEditorForm,
  Card,
  CardContent,
  EditorToolbar,
  buttonVariants,
} from '@interface/components';
import { Link, useParams } from '@tanstack/solid-router';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';

export function ArmyEditorPage(): JSX.Element {
  const params = useParams({ from: '/admin/armies/$gameMode/$armyId' });
  const unitCatalog = useCurrentUnitCardsQuery();
  const commandCatalog = useCurrentCommandCardsQuery();

  const editor = useArmyEditor(
    () => params().armyId,
    () => params().gameMode,
  );

  const modeOk = () => isGameModeName(params().gameMode);

  return (
    <main class="container mx-auto flex flex-col gap-6 p-4 py-8">
      <div class="flex items-center gap-2 text-sm">
        <Link
          to="/armies"
          class={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          ← Armies
        </Link>
      </div>

      <Show
        when={modeOk()}
        fallback={
          <Card>
            <CardContent class="py-6">
              <p class="text-destructive text-sm">
                Unknown game mode “{params().gameMode}”.
              </p>
            </CardContent>
          </Card>
        }
      >
        <Show
          when={!editor.isLoading()}
          fallback={<p class="text-muted-foreground">Loading army…</p>}
        >
          <Show
            when={editor.draft()}
            fallback={
              <Card>
                <CardContent class="py-6">
                  <p class="text-destructive text-sm">
                    {editor.loadErrorMessage() ?? 'Army not found.'}
                  </p>
                  <Show when={editor.shapeErrors().length > 0}>
                    <ul class="text-destructive mt-2 list-disc space-y-1 pl-5 text-sm">
                      <For each={editor.shapeErrors()}>
                        {(message) => <li>{message}</li>}
                      </For>
                    </ul>
                  </Show>
                </CardContent>
              </Card>
            }
          >
            {(army) => (
              <>
                <EditorToolbar
                  title={() => army().units[0]?.unitType.name ?? 'Empty army'}
                  subtitle={() =>
                    `Editing under ${editor.gameMode() ?? '—'} rules · Save stores army shape only`
                  }
                  isSaving={() => editor.update.isPending}
                  saveLabel={() => 'Save'}
                  savingLabel={() => 'Saving…'}
                  onSave={editor.save}
                />

                <Show when={editor.shapeErrors().length > 0}>
                  <Card>
                    <CardContent class="py-6">
                      <ul class="text-destructive list-disc space-y-1 pl-5 text-sm">
                        <For each={editor.shapeErrors()}>
                          {(message) => <li>{message}</li>}
                        </For>
                      </ul>
                    </CardContent>
                  </Card>
                </Show>

                <Show when={editor.update.isError}>
                  <Card>
                    <CardContent class="py-6">
                      <p class="text-destructive text-sm">
                        {editor.update.error instanceof Error
                          ? editor.update.error.message
                          : 'Failed to save army.'}
                      </p>
                    </CardContent>
                  </Card>
                </Show>

                <ArmyEditorForm
                  army={army}
                  gameMode={editor.gameMode}
                  budget={editor.budget}
                  isModeValid={editor.isModeValid}
                  unitCatalog={() => unitCatalog.data}
                  isUnitCatalogLoading={() => unitCatalog.isLoading}
                  commandCatalog={() => commandCatalog.data}
                  isCommandCatalogLoading={() => commandCatalog.isLoading}
                  canAddUnit={editor.canAddUnit}
                  maxCopiesFor={editor.maxCopiesFor}
                  canAddCommand={editor.canAddCommand}
                  onSetUnitCount={editor.setUnitCount}
                  onRemoveUnit={editor.removeUnit}
                  onAddCommandCard={editor.addCommandCard}
                  onRemoveCommandCard={editor.removeCommandCard}
                />
              </>
            )}
          </Show>
        </Show>
      </Show>
    </main>
  );
}
