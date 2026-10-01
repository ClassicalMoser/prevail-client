import { createVsBotGameContract } from '@classicalmoser/prevail-contracts';
import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import type { Callers } from '../callers';
import type { CreatedPostResponse } from '../http';

interface GameResources {
  createVsBotGame(
    body: CreateVsBotGameBody,
  ): Promise<CreatedPostResponse<string>>;
}

function createGameResources({
  callPost,
}: Pick<Callers, 'callPost'>): GameResources {
  return {
    createVsBotGame(body) {
      return callPost(createVsBotGameContract, {
        params: {},
        query: {},
        body,
      });
    },
  };
}

export { type GameResources, createGameResources };
