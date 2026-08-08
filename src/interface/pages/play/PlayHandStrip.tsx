import type { CellHighlight, UseSeatPlaySessionResult } from '@application';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { FaceDownCardThumb, PublishedCardThumb } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';

export function PlayHandStrip(props: {
  session: UseSeatPlaySessionResult;
  handSelectable: Accessor<boolean>;
  onHandCardActivate: (card: CommandCard) => void;
}): JSX.Element {
  return (
    <Show
      when={
        props.session.handCards().length > 0 || props.session.canRefuseCommit()
      }
    >
      <section
        class="border-border bg-background shrink-0 border-t px-2 py-2"
        aria-label="Your hand"
      >
        <Show when={props.handSelectable()}>
          <p class="text-muted-foreground mb-1 text-center text-xs">
            Your hand — tap a highlighted card
          </p>
        </Show>
        <div class="mx-auto flex max-w-5xl flex-wrap items-end justify-center gap-1.5 overflow-visible sm:gap-2">
          <Show when={props.session.canRefuseCommit()}>
            <FaceDownCardThumb
              label="Don't commit"
              stamp="Skip"
              selected
              disabled={props.session.choicePending()}
              onActivate={props.session.onRefuseCommit}
            />
          </Show>
          <For each={props.session.handCards()}>
            {(card) => {
              const highlight = (): CellHighlight | undefined =>
                props.session.cardHighlights()[card.id];
              const selected = () => highlight() === 'selected';
              const legal = () => highlight() === 'legal';
              return (
                <Show
                  when={props.handSelectable()}
                  fallback={
                    <PublishedCardThumb
                      kind="command"
                      id={card.id}
                      version={card.version}
                      name={card.name}
                      size="xs"
                    />
                  }
                >
                  <PublishedCardThumb
                    kind="command"
                    id={card.id}
                    version={card.version}
                    name={card.name}
                    size="xs"
                    selected={selected() || legal()}
                    disabled={
                      highlight() === undefined || props.session.choicePending()
                    }
                    onActivate={() => props.onHandCardActivate(card)}
                  />
                </Show>
              );
            }}
          </For>
        </div>
      </section>
    </Show>
  );
}
