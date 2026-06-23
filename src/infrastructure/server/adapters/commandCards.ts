import type { CommandCards } from '@ports';
import {
  unwrapCreatedRouteResponsePromise,
  unwrapRouteResponsePromise,
} from '../http';
import type { CommandCardResources } from '../resources';

/**
 * Port adapter: strips HTTP envelopes and surfaces plain domain types.
 * Application code sees `Card` or a thrown {@link RouteResponseError}, not
 * `{ data } | { message }`.
 */
export function createCommandCardsAdapter(
  resources: CommandCardResources,
): CommandCards {
  return {
    getCurrent: () =>
      unwrapRouteResponsePromise(resources.getCurrentCommandCards()),
    getById: (id) =>
      unwrapRouteResponsePromise(resources.getCommandCardById({ id })),
    getByIds: (ids) =>
      unwrapRouteResponsePromise(
        resources.getCommandCardsByIds({ ids: [...ids] }),
      ),
    createDraft: () =>
      unwrapCreatedRouteResponsePromise(resources.createEmptyCommandCard()),
    publishVersion: (card) =>
      unwrapCreatedRouteResponsePromise(
        resources.createCommandCardVersion(card),
      ),
    certifyLatest: () =>
      unwrapCreatedRouteResponsePromise(
        resources.certifyLatestCommandCardVersions(),
      ),
    preview: (card) =>
      unwrapRouteResponsePromise(resources.previewCommandCard(card)),
  };
}
