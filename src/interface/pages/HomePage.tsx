import { useCore } from '@application';
import { BoardComponent, Button, GameStatus } from '@interface';
import type { JSX } from 'solid-js';

export function HomePage(): JSX.Element {
  const core = useCore();

  const handleButtonClick = async () => {
    await core.startNewGame('tutorial');
  };

  return (
    <main class="container flex flex-col items-center justify-center mx-auto p-4 gap-4">
      <h1 class="text-4xl font-display text-center">Prevail</h1>

      <Button type="button" onClick={handleButtonClick}>
        Create New Game
      </Button>

      <GameStatus
        hasGameState={core.game.hasGameState}
        roundNumber={core.game.roundNumber}
        initiative={core.game.initiative}
        phaseSummary={core.game.phaseSummary}
      />

      <div class="board-host flex flex-col gap-2 justify-center">
        <BoardComponent board={core.game.board} cells={core.game.boardCells} />
      </div>
    </main>
  );
}
