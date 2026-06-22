import type { UnitCards } from '@ports';
import {
  unwrapCreatedRouteResponsePromise,
  unwrapRouteResponsePromise,
} from '../http';
import {
  certifyLatestUnitCardVersions,
  createEmptyUnitCard,
  createUnitCardVersion,
  getCurrentUnitCards,
  getUnitCardById,
  getUnitCardsByIds,
  previewUnitCard,
} from '../resources';

export const unitCards: UnitCards = {
  getCurrent: () => unwrapRouteResponsePromise(getCurrentUnitCards()),
  getById: (id) => unwrapRouteResponsePromise(getUnitCardById({ id })),
  getByIds: (ids) =>
    unwrapRouteResponsePromise(getUnitCardsByIds({ ids: [...ids] })),
  createDraft: () => unwrapCreatedRouteResponsePromise(createEmptyUnitCard()),
  publishVersion: (card) =>
    unwrapCreatedRouteResponsePromise(createUnitCardVersion(card)),
  certifyLatest: () =>
    unwrapCreatedRouteResponsePromise(certifyLatestUnitCardVersions()),
  preview: (card) => unwrapRouteResponsePromise(previewUnitCard(card)),
};
