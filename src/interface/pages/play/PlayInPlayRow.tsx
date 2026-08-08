import type { PlayCardSlotView } from '@application';
import { FaceDownCardThumb, PublishedCardThumb } from '@interface/components';
import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';

function SlotView(props: {
  slot: Accessor<PlayCardSlotView>;
  sideLabel: Accessor<string>;
}): JSX.Element {
  return (
    <Show when={props.slot().kind !== 'empty'}>
      <div class="play-in-play__seat">
        <p class="play-in-play__label">{props.sideLabel()}</p>
        <Show
          when={
            props.slot().kind === 'card'
              ? (props.slot() as Extract<PlayCardSlotView, { kind: 'card' }>)
              : undefined
          }
          fallback={
            <Show
              when={
                props.slot().kind === 'facedown'
                  ? (props.slot() as Extract<
                      PlayCardSlotView,
                      { kind: 'facedown' }
                    >)
                  : undefined
              }
            >
              {(facedown) => (
                <FaceDownCardThumb label={facedown().label} stamp="Play" />
              )}
            </Show>
          }
        >
          {(revealed) => (
            <PublishedCardThumb
              kind="command"
              id={revealed().card.id}
              version={revealed().card.version}
              name={revealed().card.name}
              size="xs"
              hideCaption
              frame="bare"
            />
          )}
        </Show>
      </div>
    </Show>
  );
}

/**
 * Active command cards — vertical stack left of the board.
 */
export function PlayInPlayRow(props: {
  you: Accessor<PlayCardSlotView>;
  opponent: Accessor<PlayCardSlotView>;
}): JSX.Element {
  const hasContent = (): boolean =>
    props.you().kind !== 'empty' || props.opponent().kind !== 'empty';

  return (
    <Show when={hasContent()}>
      <div class="play-in-play" aria-label="Cards in play">
        <SlotView slot={props.opponent} sideLabel={() => 'Opp'} />
        <SlotView slot={props.you} sideLabel={() => 'You'} />
      </div>
    </Show>
  );
}
