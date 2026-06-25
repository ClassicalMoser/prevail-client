import {
  updateCommandCardCertificationsContract,
  createCommandCardVersionContract,
  createEmptyCommandCardContract,
  deleteEmptyCommandCardsContract,
  getAllCommandCardsContract,
  getCommandCardByIdContract,
  getCommandCardsByIdsContract,
  getCurrentCommandCardsContract,
  previewCommandCardContract,
} from '@classicalmoser/prevail-contracts';
import type {
  CardListItem,
  CertificationResults,
  GetByIdParams,
  QueryByIdsBody,
} from '@classicalmoser/prevail-contracts';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import type { Callers } from '../callers';
import type {
  CreatedPostResponse,
  ErrorResponse,
  GetResponse,
  MediaPostResponse,
  PostResponse,
} from '../http';

/**
 * One function per prevail-contracts command-card route.
 * Wires contract constants to the matching caller; still returns HTTP envelopes.
 */
export interface CommandCardResources {
  getAllCommandCards(): Promise<GetResponse<CardListItem[]>>;
  getCommandCardById(params: GetByIdParams): Promise<GetResponse<Card>>;
  getCommandCardsByIds(body: QueryByIdsBody): Promise<PostResponse<Card[]>>;
  getCurrentCommandCards(): Promise<GetResponse<Card[]>>;
  createEmptyCommandCard(): Promise<CreatedPostResponse<string>>;
  createCommandCardVersion(card: Card): Promise<CreatedPostResponse<Card>>;
  updateCommandCardCertifications(): Promise<
    PostResponse<CertificationResults>
  >;
  deleteEmptyCommandCards(): Promise<ErrorResponse | undefined>;
  previewCommandCard(card: Card): Promise<MediaPostResponse<string>>;
}

export function createCommandCardResources({
  callDelete,
  callGet,
  callMediaPost,
  callPost,
}: Pick<
  Callers,
  'callDelete' | 'callGet' | 'callMediaPost' | 'callPost'
>): CommandCardResources {
  return {
    getAllCommandCards() {
      return callGet(getAllCommandCardsContract, { params: {}, query: {} });
    },

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

    updateCommandCardCertifications() {
      return callPost(updateCommandCardCertificationsContract, {
        params: {},
        query: {},
        body: {},
      });
    },

    deleteEmptyCommandCards() {
      return callDelete(deleteEmptyCommandCardsContract, {
        params: {},
        query: {},
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
