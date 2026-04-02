import type { Card } from "@classicalmoser/prevail-rules/domain";
import { boardCellDemo, useCore } from "@application";
import { tempCommandCards } from "@classicalmoser/prevail-rules/domain";
import { BoardComponent, CardComponent } from "@interface";
import { For } from "solid-js";

function App() {
  const core = useCore();

  const cardStubs: Card[] = [...tempCommandCards.slice(7, 13)];

  const handleButtonClick = async () => {
    await core.startNewGame("tutorial");
  };

  return (
    <main class="container">
      <h1>Prevail</h1>

      <button type="button" onClick={handleButtonClick}>
        Create New Game
      </button>
      <div class="board-host">
        <BoardComponent board={core.subscribedBoard} cellDemo={boardCellDemo} />
        <For each={cardStubs}>
          {(cardStub) => <CardComponent card={cardStub} />}
        </For>
      </div>
    </main>
  );
}

export default App;
