import type { EnginePorts } from "@classicalmoser/prevail-rules/application";
import { createGameRunner } from "@classicalmoser/prevail-rules/application";

export const useEngine = (ports: EnginePorts) => {
  const gameRunner = createGameRunner(ports);
  const { startNewGame, handlePlayerChoiceSubmission } = gameRunner;
  return { startNewGame, handlePlayerChoiceSubmission };
};
