import {
  certifyLatestCommandCardVersionsContract,
  createCommandCardVersionContract,
  createEmptyCommandCardContract,
  getCommandCardByIdContract,
  getCurrentCommandCardsContract,
} from '@classicalmoser/prevail-contracts/contracts';
import type {
  CertificationResults,
  GetByIdParams,
} from '@classicalmoser/prevail-contracts';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import { callGet, callPost } from '../callers';
import type { CreatedPostResponse, GetResponse } from '../http';

export function getCommandCardById(
  params: GetByIdParams,
): Promise<GetResponse<Card>> {
  return callGet(getCommandCardByIdContract, { params, query: {} });
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
