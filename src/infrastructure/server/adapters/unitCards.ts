import type { UnitCards } from '@ports';
import {
  unwrapCreatedRouteResponsePromise,
  unwrapRouteResponsePromise,
} from '../http';
import type { UnitCardResources } from '../resources';

/**
 * Port adapter: strips HTTP envelopes and surfaces plain domain types.
 * Application code sees `UnitType` or a thrown {@link RouteResponseError}, not
 * `{ data } | { message }`.
 */
export function createUnitCardsAdapter(
  resources: UnitCardResources,
): UnitCards {
  return {
    getCurrent: () =>
      unwrapRouteResponsePromise(resources.getCurrentUnitCards()),
    getById: (id) =>
      unwrapRouteResponsePromise(resources.getUnitCardById({ id })),
    getByIds: (ids) =>
      unwrapRouteResponsePromise(
        resources.getUnitCardsByIds({ ids: [...ids] }),
      ),
    createDraft: () =>
      unwrapCreatedRouteResponsePromise(resources.createEmptyUnitCard()),
    publishVersion: (card) =>
      unwrapCreatedRouteResponsePromise(resources.createUnitCardVersion(card)),
    certifyLatest: () =>
      unwrapCreatedRouteResponsePromise(
        resources.certifyLatestUnitCardVersions(),
      ),
    preview: (card) =>
      unwrapRouteResponsePromise(resources.previewUnitCard(card)),
  };
}
