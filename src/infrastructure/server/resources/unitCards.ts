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
import { callGet, callMediaPost, callPost } from '../callers';
import type {
  CreatedPostResponse,
  GetResponse,
  MediaPostResponse,
  PostResponse,
} from '../http';

export function getUnitCardById(
  params: GetByIdParams,
): Promise<GetResponse<UnitType>> {
  return callGet(getUnitCardByIdContract, { params, query: {} });
}

export function getUnitCardsByIds(
  body: QueryByIdsBody,
): Promise<PostResponse<UnitType[]>> {
  return callPost(getUnitCardsByIdsContract, {
    params: {},
    query: {},
    body,
  });
}

export function getCurrentUnitCards(): Promise<GetResponse<UnitType[]>> {
  return callGet(getCurrentUnitCardsContract, { params: {}, query: {} });
}

export function createEmptyUnitCard(): Promise<CreatedPostResponse<string>> {
  return callPost(createEmptyUnitCardContract, {
    params: {},
    query: {},
    body: {},
  });
}

export function createUnitCardVersion(
  card: UnitType,
): Promise<CreatedPostResponse<UnitType>> {
  return callPost(createUnitCardVersionContract, {
    params: {},
    query: {},
    body: card,
  });
}

export function certifyLatestUnitCardVersions(): Promise<
  CreatedPostResponse<CertificationResults>
> {
  return callPost(certifyLatestUnitCardVersionsContract, {
    params: {},
    query: {},
    body: {},
  });
}

export function previewUnitCard(
  card: UnitType,
): Promise<MediaPostResponse<string>> {
  return callMediaPost(previewUnitCardContract, {
    params: {},
    query: {},
    body: card,
  });
}
