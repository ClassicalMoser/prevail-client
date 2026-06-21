import type { GetRoute } from '@classicalmoser/prevail-contracts';
import { buildRequestUrl, fetchGetResponse } from '../http';
import type { GetResponse, RouteCallArgs } from '../http';

interface GetCallerConfig {
  serverUrl: string;
}

export function createGetCaller({ serverUrl }: GetCallerConfig) {
  return async function callGet<
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
  >(
    route: GetRoute<TParams, TQuery, TData>,
    args: RouteCallArgs<TParams, TQuery>,
  ): Promise<GetResponse<TData>> {
    const url = buildRequestUrl(serverUrl, route.path, args.params, args.query);

    return fetchGetResponse(url, route);
  };
}
