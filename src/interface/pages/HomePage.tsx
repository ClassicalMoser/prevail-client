import { useCore } from '@application';
import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';
import { HomeHero } from './home/HomeHero';
import { HomeTutorial } from './home/HomeTutorial';
import './home/home.css';

export function HomePage(): JSX.Element {
  const core = useCore();
  const [starting, setStarting] = createSignal(false);

  const onStartTutorial = (): void => {
    if (starting()) {
      return;
    }
    const run = async (): Promise<void> => {
      setStarting(true);
      try {
        await core.startNewGame('tutorial');
      } catch (error) {
        console.error(error);
      } finally {
        setStarting(false);
      }
    };
    // Fire-and-forget from a sync click handler.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- click handler
    run();
  };

  return (
    <main class="home-page">
      <HomeHero />
      <HomeTutorial
        hasGameState={core.game.hasGameState}
        board={core.game.board}
        cells={core.game.boardCells}
        onStartTutorial={onStartTutorial}
        starting={starting}
      />
    </main>
  );
}
