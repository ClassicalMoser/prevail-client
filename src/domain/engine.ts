import type {
  EnginePorts,
  GameRunner,
} from '@classicalmoser/prevail-rules/application';
import { createGameRunner } from '@classicalmoser/prevail-rules/application';

export const useEngine = (ports: EnginePorts): GameRunner =>
  createGameRunner(ports);
