import type { PutRoute } from '@classicalmoser/prevail-contracts';
import type { BodyRouteCallArgs, PutResponse } from '../http';
import { buildRequestUrl, fetchPutResponse } from '../http';

interface PutCallerConfig {
  serverUrl: string;
}

export function createPutCaller({ serverUrl }: PutCallerConfig) {
  return async function callPut<
    TData,
    TParams extends Record<string, unknown>,
    TQuery extends Record<string, unknown>,
    TBody,
  >(
    route: PutRoute<TParams, TQuery, TBody, TData>,
    args: BodyRouteCallArgs<TParams, TQuery, TBody>,
  ): Promise<PutResponse<TData>> {
    const url = buildRequestUrl(serverUrl, route.path, args.params, args.query);

    return fetchPutResponse(url, route, args.body);
  };
}
