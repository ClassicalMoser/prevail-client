import {
  updateUnitCardCertificationsContract,
  createEmptyUnitCardContract,
  createUnitCardVersionContract,
  deleteEmptyUnitCardsContract,
  getAllUnitCardsContract,
  getCurrentUnitCardsContract,
  getUnitCardByIdContract,
  getUnitCardsByIdsContract,
  previewUnitCardContract,
} from '@classicalmoser/prevail-contracts';
import type {
  CardListItem,
  CertificationResults,
  GetByIdParams,
  QueryByIdsBody,
} from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { Callers } from '../callers';
import type {
  CreatedPostResponse,
  ErrorResponse,
  GetResponse,
  MediaPostResponse,
  PostResponse,
} from '../http';

/**
 * One function per prevail-contracts unit-card route.
 * Wires contract constants to the matching caller; still returns HTTP envelopes.
 */
export interface UnitCardResources {
  getAllUnitCards(): Promise<GetResponse<CardListItem[]>>;
  getUnitCardById(params: GetByIdParams): Promise<GetResponse<UnitType>>;
  getUnitCardsByIds(body: QueryByIdsBody): Promise<PostResponse<UnitType[]>>;
  getCurrentUnitCards(): Promise<GetResponse<UnitType[]>>;
  createEmptyUnitCard(): Promise<CreatedPostResponse<string>>;
  createUnitCardVersion(card: UnitType): Promise<CreatedPostResponse<UnitType>>;
  updateUnitCardCertifications(): Promise<PostResponse<CertificationResults>>;
  deleteEmptyUnitCards(): Promise<ErrorResponse | undefined>;
  previewUnitCard(card: UnitType): Promise<MediaPostResponse<string>>;
}

export function createUnitCardResources({
  callDelete,
  callGet,
  callMediaPost,
  callPost,
}: Pick<
  Callers,
  'callDelete' | 'callGet' | 'callMediaPost' | 'callPost'
>): UnitCardResources {
  return {
    getAllUnitCards() {
      return callGet(getAllUnitCardsContract, { params: {}, query: {} });
    },

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

    updateUnitCardCertifications() {
      return callPost(updateUnitCardCertificationsContract, {
        params: {},
        query: {},
        body: {},
      });
    },

    deleteEmptyUnitCards() {
      return callDelete(deleteEmptyUnitCardsContract, {
        params: {},
        query: {},
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
