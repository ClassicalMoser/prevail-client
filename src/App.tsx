import type { Card } from "@classicalmoser/prevail-rules/domain";
import { boardCellDemo, useCore } from "@application";
import { tempCommandCards } from "@classicalmoser/prevail-rules/domain";
import { BoardComponent, Button, CardComponent } from "@interface";
import type { JSX } from "solid-js";
import { For } from "solid-js";

function App(): JSX.Element {
  const core = useCore();

  const cardStubs: Card[] = [...tempCommandCards];

  const handleButtonClick = async () => {
    await core.startNewGame("tutorial");
  };

  return (
    <main class="container flex flex-col items-center justify-center mx-auto p-4">
      <h1 class="text-4xl font-display text-center mb-4">Prevail</h1>

      <Button type="button" onClick={handleButtonClick}>
        Create New Game
      </Button>
      <div class="board-host flex flex-col gap-2 justify-center">
        <BoardComponent board={core.subscribedBoard} cellDemo={boardCellDemo} />
        <div class="flex flex-wrap flex-row gap-2">
          <For each={cardStubs}>{(cardStub) => <CardComponent card={cardStub} />}</For>
        </div>
      </div>
    </main>
  );
}

// eslint-disable-next-line import/no-default-export
export default App;
