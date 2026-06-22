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
import { callGet, callMediaPost, callPost } from '../callers';
import type {
  CreatedPostResponse,
  GetResponse,
  MediaPostResponse,
  PostResponse,
} from '../http';

export function getCommandCardById(
  params: GetByIdParams,
): Promise<GetResponse<Card>> {
  return callGet(getCommandCardByIdContract, { params, query: {} });
}

export function getCommandCardsByIds(
  body: QueryByIdsBody,
): Promise<PostResponse<Card[]>> {
  return callPost(getCommandCardsByIdsContract, {
    params: {},
    query: {},
    body,
  });
}

export function getCurrentCommandCards(): Promise<GetResponse<Card[]>> {
  return callGet(getCurrentCommandCardsContract, { params: {}, query: {} });
}

export function createEmptyCommandCard(): Promise<CreatedPostResponse<string>> {
  return callPost(createEmptyCommandCardContract, {
    params: {},
    query: {},
    body: {},
  });
}

export function createCommandCardVersion(
  card: Card,
): Promise<CreatedPostResponse<Card>> {
  return callPost(createCommandCardVersionContract, {
    params: {},
    query: {},
    body: card,
  });
}

export function certifyLatestCommandCardVersions(): Promise<
  CreatedPostResponse<CertificationResults>
> {
  return callPost(certifyLatestCommandCardVersionsContract, {
    params: {},
    query: {},
    body: {},
  });
}

export function previewCommandCard(
  card: Card,
): Promise<MediaPostResponse<string>> {
  return callMediaPost(previewCommandCardContract, {
    params: {},
    query: {},
    body: card,
  });
}
