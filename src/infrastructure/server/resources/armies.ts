import {
  archiveOwnedArmyContract,
  createOwnedArmyContract,
  getOwnedArmiesContract,
  getOwnedArmyByIdContract,
  updateOwnedArmyContract,
} from '@classicalmoser/prevail-contracts';
import type {
  ArmyWriteBody,
  EmptyObject,
  GetByIdParams,
} from '@classicalmoser/prevail-contracts';
import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { Callers } from '../callers';
import type {
  CreatedPostResponse,
  ErrorResponse,
  GetResponse,
  PutResponse,
} from '../http';

/**
 * One function per prevail-contracts owned-army route.
 * Wires contract constants to the matching caller; still returns HTTP envelopes.
 */
export interface ArmyResources {
  getOwnedArmies(): Promise<GetResponse<Army[]>>;
  getOwnedArmyById(params: GetByIdParams): Promise<GetResponse<Army>>;
  createOwnedArmy(): Promise<CreatedPostResponse<string>>;
  updateOwnedArmy(
    params: GetByIdParams,
    body: ArmyWriteBody,
  ): Promise<PutResponse<EmptyObject>>;
  archiveOwnedArmy(params: GetByIdParams): Promise<ErrorResponse | undefined>;
}

export function createArmyResources({
  callDelete,
  callGet,
  callPost,
  callPut,
}: Pick<
  Callers,
  'callDelete' | 'callGet' | 'callPost' | 'callPut'
>): ArmyResources {
  return {
    getOwnedArmies() {
      return callGet(getOwnedArmiesContract, { params: {}, query: {} });
    },

    getOwnedArmyById(params) {
      return callGet(getOwnedArmyByIdContract, { params, query: {} });
    },

    createOwnedArmy() {
      return callPost(createOwnedArmyContract, {
        params: {},
        query: {},
        body: {},
      });
    },

    updateOwnedArmy(params, body) {
      return callPut(updateOwnedArmyContract, {
        params,
        query: {},
        body,
      });
    },

    archiveOwnedArmy(params) {
      return callDelete(archiveOwnedArmyContract, {
        params,
        query: {},
      });
    },
  };
}
