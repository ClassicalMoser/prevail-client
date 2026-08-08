import type { CommandCards } from '@ports';
import {
  unwrapCreatedRouteResponsePromise,
  unwrapDeleteRouteResponsePromise,
  unwrapRouteResponsePromise,
} from '../http';
import type { CommandCardResources } from '../resources';

/**
 * Port adapter: strips HTTP envelopes and surfaces plain domain types.
 * Application code sees `CommandCard` or a thrown {@link RouteResponseError}, not
 * `{ data } | { message }`.
 */
export function createCommandCardsAdapter(
  resources: CommandCardResources,
): CommandCards {
  return {
    getAll: () => unwrapRouteResponsePromise(resources.getAllCommandCards()),
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
      unwrapRouteResponsePromise(resources.updateCommandCardCertifications()),
    deleteEmpty: () =>
      unwrapDeleteRouteResponsePromise(resources.deleteEmptyCommandCards()),
    preview: (card) =>
      unwrapRouteResponsePromise(resources.previewCommandCard(card)),
  };
}
