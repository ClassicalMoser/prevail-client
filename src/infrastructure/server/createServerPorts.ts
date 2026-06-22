import type { ServerPorts } from '@ports';
import { commandCards, unitCards } from './adapters';

export function createServerPorts(): ServerPorts {
  return {
    commandCards,
    unitCards,
  };
}
