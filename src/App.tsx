import type { Board } from "@classicalmoser/prevail-rules/domain";
import { useCore } from "@application";
import { BoardComponent } from "@interface";
import { createMemo, Show } from "solid-js";

function App() {
  const core = useCore();

  const handleButtonClick = async () => {
    await core.startNewGame("standard");
  };

  const boardState = createMemo<Board | undefined>(
    () => core.subscribedGameState()?.boardState,
  );

  return (
    <main class="container">
      <h1>Prevail</h1>

      <button type="button" onClick={handleButtonClick}>
        Create New Game
      </button>
      <div class="board-host">
        <Show when={boardState()}>{(b) => <BoardComponent board={b()} />}</Show>
      </div>
    </main>
  );
}

export default App;
