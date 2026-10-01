import { createGameRunner } from '@classicalmoser/prevail-rules/application';
import type {
  EnginePorts,
  GameRunner,
} from '@classicalmoser/prevail-rules/application';

/**
 * Build the rules-package game runner.
 * This module is the only place the client constructs that runner.
 * Callers pass engine ports in and get a runner back. No Solid.
 */
function createEngine(ports: EnginePorts): GameRunner {
  const runner = createGameRunner(ports);
  return runner;
}

export { createEngine };
