import type { Games } from '@ports';
import { unwrapCreatedRouteResponsePromise } from '../http';
import type { GameResources } from '../resources';

export function createGamesAdapter(resources: GameResources): Games {
  return {
    createVsBot: (body) =>
      unwrapCreatedRouteResponsePromise(resources.createVsBotGame(body)),
  };
}
