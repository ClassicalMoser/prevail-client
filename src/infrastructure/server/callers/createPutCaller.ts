import type { PutRoute } from '@classicalmoser/prevail-contracts';
import { buildRequestUrl } from '../http';
import type { BodyRouteCallArgs, PutResponse } from '../http';
import type { CallerDependencies } from './callerDependencies';

type CallPut = <
  TData,
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
>(
  route: PutRoute<TParams, TQuery, TBody, TData>,
  args: BodyRouteCallArgs<TParams, TQuery, TBody>,
) => Promise<PutResponse<TData>>;

function createPutCaller({
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
    const url = buildRequestUrl(serverUrl, {
      path: route.path,
      params: args.params,
      query: args.query,
    });

    return routeFetch.fetchPutResponse(url, route, args.body);
  };
}

export { type CallPut, createPutCaller };
