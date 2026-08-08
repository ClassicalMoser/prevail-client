import type {
  EnginePorts,
  GameRunner,
} from '@classicalmoser/prevail-rules/application';
import { createGameRunner } from '@classicalmoser/prevail-rules/application';

export const useEngine = (ports: EnginePorts): GameRunner => {
  const gameRunner = createGameRunner(ports);
  const {
    startNewGame,
    handlePlayerChoiceSubmission,
    requestGameStateSnapshot,
  } = gameRunner;
  return {
    startNewGame,
    handlePlayerChoiceSubmission,
    requestGameStateSnapshot,
  };
};
