import type { BoardCellView } from '@application';
import type { Board } from '@classicalmoser/prevail-rules/domain';
import { BoardComponent } from '@interface/board';
import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';

export function HomeTutorial(props: {
  hasGameState: Accessor<boolean>;
  board: Accessor<Board | undefined>;
  cells: Accessor<Readonly<Partial<Record<string, BoardCellView>>>>;
  onStartTutorial: () => void;
  starting: Accessor<boolean>;
}): JSX.Element {
  return (
    <section class="home-tutorial" aria-labelledby="home-tutorial-heading">
      <div class="home-tutorial__copy">
        <h2 id="home-tutorial-heading" class="home-tutorial__title">
          Local tutorial mode
        </h2>
        <p class="home-tutorial__body">
          Runs the rules engine in this browser with the built-in tutorial game
          mode. Not a guided lesson, and not a server match.
        </p>
        <div>
          <button
            type="button"
            class="home-tutorial__start"
            disabled={props.starting()}
            onClick={() => {
              props.onStartTutorial();
            }}
          >
            {props.starting() ? 'Starting…' : 'Start tutorial mode'}
          </button>
        </div>
      </div>
      <Show when={props.hasGameState()}>
        <div class="home-tutorial__board board-host">
          <BoardComponent board={props.board} cells={props.cells} />
        </div>
      </Show>
    </section>
  );
}
