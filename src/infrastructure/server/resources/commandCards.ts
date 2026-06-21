import {
  getCommandCardByIdContract,
  getCurrentCommandCardsContract,
} from '@classicalmoser/prevail-contracts/contracts';
import type { GetByIdParams } from '@classicalmoser/prevail-contracts/domain';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import { callGet } from '../callers';
import type { GetResponse } from '../http';

export function getCommandCardById(
  params: GetByIdParams,
): Promise<GetResponse<Card>> {
  return callGet(getCommandCardByIdContract, { params, query: {} });
}

export function getCurrentCommandCards(): Promise<GetResponse<Card[]>> {
  return callGet(getCurrentCommandCardsContract, { params: {}, query: {} });
}
