import type { CommandCards } from '@ports';
import {
  unwrapCreatedRouteResponsePromise,
  unwrapRouteResponsePromise,
} from '../http';
import {
  certifyLatestCommandCardVersions,
  createCommandCardVersion,
  createEmptyCommandCard,
  getCommandCardById,
  getCommandCardsByIds,
  getCurrentCommandCards,
  previewCommandCard,
} from '../resources';

export const commandCards: CommandCards = {
  getCurrent: () => unwrapRouteResponsePromise(getCurrentCommandCards()),
  getById: (id) => unwrapRouteResponsePromise(getCommandCardById({ id })),
  getByIds: (ids) =>
    unwrapRouteResponsePromise(getCommandCardsByIds({ ids: [...ids] })),
  createDraft: () =>
    unwrapCreatedRouteResponsePromise(createEmptyCommandCard()),
  publishVersion: (card) =>
    unwrapCreatedRouteResponsePromise(createCommandCardVersion(card)),
  certifyLatest: () =>
    unwrapCreatedRouteResponsePromise(certifyLatestCommandCardVersions()),
  preview: (card) => unwrapRouteResponsePromise(previewCommandCard(card)),
};
