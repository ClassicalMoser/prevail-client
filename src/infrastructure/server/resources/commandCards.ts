import {
  certifyLatestCommandCardVersionsContract,
  createCommandCardVersionContract,
  createEmptyCommandCardContract,
  getCommandCardByIdContract,
  getCommandCardsByIdsContract,
  getCurrentCommandCardsContract,
  previewCommandCardContract,
} from '@classicalmoser/prevail-contracts';
import type {
  CertificationResults,
  GetByIdParams,
  QueryByIdsBody,
} from '@classicalmoser/prevail-contracts';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { Callers } from '../callers';
import type {
  CreatedPostResponse,
  GetResponse,
  MediaPostResponse,
  PostResponse,
} from '../http';

/**
 * One function per prevail-contracts command-card route.
 * Wires contract constants to the matching caller; still returns HTTP envelopes.
 */
export interface CommandCardResources {
  getCommandCardById(params: GetByIdParams): Promise<GetResponse<Card>>;
  getCommandCardsByIds(body: QueryByIdsBody): Promise<PostResponse<Card[]>>;
  getCurrentCommandCards(): Promise<GetResponse<Card[]>>;
  createEmptyCommandCard(): Promise<CreatedPostResponse<string>>;
  createCommandCardVersion(card: Card): Promise<CreatedPostResponse<Card>>;
  certifyLatestCommandCardVersions(): Promise<
    CreatedPostResponse<CertificationResults>
  >;
  previewCommandCard(card: Card): Promise<MediaPostResponse<string>>;
}

export function createCommandCardResources({
  callGet,
  callMediaPost,
  callPost,
}: Pick<
  Callers,
  'callGet' | 'callMediaPost' | 'callPost'
>): CommandCardResources {
  return {
    getCommandCardById(params) {
      return callGet(getCommandCardByIdContract, { params, query: {} });
    },

    getCommandCardsByIds(body) {
      return callPost(getCommandCardsByIdsContract, {
        params: {},
        query: {},
        body,
      });
    },

    getCurrentCommandCards() {
      return callGet(getCurrentCommandCardsContract, { params: {}, query: {} });
    },

    createEmptyCommandCard() {
      return callPost(createEmptyCommandCardContract, {
        params: {},
        query: {},
        body: {},
      });
    },

    createCommandCardVersion(card) {
      return callPost(createCommandCardVersionContract, {
        params: {},
        query: {},
        body: card,
      });
    },

    certifyLatestCommandCardVersions() {
      return callPost(certifyLatestCommandCardVersionsContract, {
        params: {},
        query: {},
        body: {},
      });
    },

    previewCommandCard(card) {
      return callMediaPost(previewCommandCardContract, {
        params: {},
        query: {},
        body: card,
      });
    },
  };
}
