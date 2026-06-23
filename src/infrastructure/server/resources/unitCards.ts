import {
  certifyLatestUnitCardVersionsContract,
  createEmptyUnitCardContract,
  createUnitCardVersionContract,
  getCurrentUnitCardsContract,
  getUnitCardByIdContract,
  getUnitCardsByIdsContract,
  previewUnitCardContract,
} from '@classicalmoser/prevail-contracts';
import type {
  CertificationResults,
  GetByIdParams,
  QueryByIdsBody,
} from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { Callers } from '../callers';
import type {
  CreatedPostResponse,
  GetResponse,
  MediaPostResponse,
  PostResponse,
} from '../http';

/**
 * One function per prevail-contracts unit-card route.
 * Wires contract constants to the matching caller; still returns HTTP envelopes.
 */
export interface UnitCardResources {
  getUnitCardById(params: GetByIdParams): Promise<GetResponse<UnitType>>;
  getUnitCardsByIds(body: QueryByIdsBody): Promise<PostResponse<UnitType[]>>;
  getCurrentUnitCards(): Promise<GetResponse<UnitType[]>>;
  createEmptyUnitCard(): Promise<CreatedPostResponse<string>>;
  createUnitCardVersion(card: UnitType): Promise<CreatedPostResponse<UnitType>>;
  certifyLatestUnitCardVersions(): Promise<
    CreatedPostResponse<CertificationResults>
  >;
  previewUnitCard(card: UnitType): Promise<MediaPostResponse<string>>;
}

export function createUnitCardResources({
  callGet,
  callMediaPost,
  callPost,
}: Pick<Callers, 'callGet' | 'callMediaPost' | 'callPost'>): UnitCardResources {
  return {
    getUnitCardById(params) {
      return callGet(getUnitCardByIdContract, { params, query: {} });
    },

    getUnitCardsByIds(body) {
      return callPost(getUnitCardsByIdsContract, {
        params: {},
        query: {},
        body,
      });
    },

    getCurrentUnitCards() {
      return callGet(getCurrentUnitCardsContract, { params: {}, query: {} });
    },

    createEmptyUnitCard() {
      return callPost(createEmptyUnitCardContract, {
        params: {},
        query: {},
        body: {},
      });
    },

    createUnitCardVersion(card) {
      return callPost(createUnitCardVersionContract, {
        params: {},
        query: {},
        body: card,
      });
    },

    certifyLatestUnitCardVersions() {
      return callPost(certifyLatestUnitCardVersionsContract, {
        params: {},
        query: {},
        body: {},
      });
    },

    previewUnitCard(card) {
      return callMediaPost(previewUnitCardContract, {
        params: {},
        query: {},
        body: card,
      });
    },
  };
}
