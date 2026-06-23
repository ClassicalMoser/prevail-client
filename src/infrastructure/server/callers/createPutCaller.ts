import type { PutRoute } from '@classicalmoser/prevail-contracts';
import type { BodyRouteCallArgs, PutResponse } from '../http';
import { buildRequestUrl } from '../http';
import type { CallerDependencies } from './callerDependencies';

export type CallPut = <
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
>(
  route: PutRoute<TParams, TQuery, TBody, TData>,
  args: BodyRouteCallArgs<TParams, TQuery, TBody>,
) => Promise<PutResponse<TData>>;

export function createPutCaller({
  serverUrl,
  routeFetch,
}: CallerDependencies): CallPut {
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

    return routeFetch.fetchPutResponse(url, route, args.body);
  };
}
