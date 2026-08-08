import type { CellHighlight, UseSeatPlaySessionResult } from '@application';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { FaceDownCardThumb, PublishedCardThumb } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { For, Show } from 'solid-js';

/**
 * Your hand — title-band peek; dock enlarge follows the small hit targets
 * (expanded art does not steal hover from neighbors).
 */
export function PlayHandStrip(props: {
  session: UseSeatPlaySessionResult;
  handSelectable: Accessor<boolean>;
  onHandCardActivate: (card: CommandCard) => void;
}): JSX.Element {
  const hand = (): CommandCard[] => props.session.handCards();
  const showRefuse = (): boolean => props.session.canRefuseCommit();
  const total = (): number => hand().length + (showRefuse() ? 1 : 0);

  return (
    <Show when={total() > 0}>
      <section class="play-hand" aria-label="Your hand">
        <div class="play-hand__row">
          <Show when={showRefuse()}>
            <div class="play-hand__card">
              <div class="play-hand__lift" aria-hidden="true">
                <FaceDownCardThumb stamp="Skip" selected />
              </div>
              <button
                type="button"
                class="play-hand__hit"
                aria-label="Skip commit"
                disabled={props.session.choicePending()}
                onClick={props.session.onRefuseCommit}
              />
            </div>
          </Show>
          <For each={hand()}>
            {(card) => {
              const highlight = (): CellHighlight | undefined =>
                props.session.cardHighlights()[card.id];
              const selected = () => highlight() === 'selected';
              const legal = () => highlight() === 'legal';
              const canActivate = () =>
                props.handSelectable() &&
                highlight() !== undefined &&
                !props.session.choicePending();
              return (
                <div
                  class="play-hand__card"
                  classList={{
                    'play-hand__card--lit': selected() || legal(),
                  }}
                >
                  <div class="play-hand__lift" aria-hidden="true">
                    <PublishedCardThumb
                      kind="command"
                      id={card.id}
                      version={card.version}
                      name={card.name}
                      size="xs"
                      hideCaption
                      frame="bare"
                      disableHoverPreview
                    />
                  </div>
                  <Show
                    when={props.handSelectable()}
                    fallback={
                      <span class="play-hand__hit play-hand__hit--static" />
                    }
                  >
                    <button
                      type="button"
                      class="play-hand__hit"
                      aria-label={card.name}
                      aria-pressed={selected() || legal()}
                      disabled={!canActivate()}
                      onClick={() => props.onHandCardActivate(card)}
                    />
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </section>
    </Show>
  );
}
