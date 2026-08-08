import type { AccessTokenGetter, ServerPorts } from '@ports';
import {
  createArmiesAdapter,
  createCommandCardsAdapter,
  createGameSeatAdapter,
  createGamesAdapter,
  createUnitCardsAdapter,
} from './adapters';
import { createCallers } from './callers';
import { createRouteFetch } from './http';
import {
  createArmyResources,
  createCommandCardResources,
  createGameResources,
  createUnitCardResources,
} from './resources';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:7412';

const WS_URL =
  import.meta.env.VITE_WS_URL ?? SERVER_URL.replace(/^http/iu, 'ws');

/**
 * Composition root for outbound server access.
 *
 * Stack (outside → in):
 * 1. **Ports** (`@ports`) — plain domain types; errors throw {@link RouteResponseError}
 * 2. **Adapters** — unwrap HTTP envelopes into port shapes
 * 3. **Resources** — map each prevail-contracts route to a caller invocation
 * 4. **Callers** — build request URLs from contract paths/args
 * 5. **RouteFetch** — `fetch`, auth headers, response parsing/validation
 *
 * Seat WebSocket uses {@link createGameSeatAdapter} with `access_token` query auth.
 */
export function createServerPorts(
  getAccessToken: AccessTokenGetter,
): ServerPorts {
  const routeFetch = createRouteFetch(getAccessToken);
  const callers = createCallers(SERVER_URL, routeFetch);
  const armyResources = createArmyResources(callers);
  const gameResources = createGameResources(callers);
  const commandCardResources = createCommandCardResources(callers);
  const unitCardResources = createUnitCardResources(callers);

  return {
    armies: createArmiesAdapter(armyResources),
    games: createGamesAdapter(gameResources),
    gameSeat: createGameSeatAdapter(WS_URL),
    commandCards: createCommandCardsAdapter(commandCardResources),
    unitCards: createUnitCardsAdapter(unitCardResources),
  };
}
