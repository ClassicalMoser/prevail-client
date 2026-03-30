import { useCore } from "@application";
import { BoardComponent } from "@interface";

function App() {
  const core = useCore();

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
        <BoardComponent
          board={core.subscribedBoard}
          cellDemo={core.boardCellDemo}
        />
      </div>
    </main>
  );
}

export default App;
