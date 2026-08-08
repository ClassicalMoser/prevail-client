import type { SideCardEconomy } from '@application';
import type { Accessor, JSX } from 'solid-js';
import { PlayCardStack } from './PlayCardStack';

/** Discard / burnt / played stacks for one seat — always visible on the table. */
export function PlaySeatPiles(props: {
  economy: Accessor<SideCardEconomy>;
  /** Visually flip layout for the far seat. */
  align?: 'start' | 'end';
}): JSX.Element {
  return (
    <div
      class="play-seat-piles"
      classList={{
        'play-seat-piles--end': props.align === 'end',
      }}
      aria-label="Card piles"
    >
      <PlayCardStack
        label={() => 'Discard'}
        count={() => props.economy().discarded}
      />
      <PlayCardStack
        label={() => 'Burnt'}
        count={() => props.economy().burnt}
      />
      <PlayCardStack
        label={() => 'Played'}
        count={() => props.economy().played}
      />
    </div>
  );
}
